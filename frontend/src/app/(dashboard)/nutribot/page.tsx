"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

/* ── Web Speech API type shim (non-standard, Chrome/Edge only) ── */
/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionInstance = any;

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Types ── */
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/* ── Quick prompt suggestions ── */
const QUICK_PROMPTS = [
  { label: "Diabetes diet", text: "আমার ডায়াবেটিস আছে। দুপুরে কি খাওয়া উচিত?", emoji: "🩸" },
  { label: "High BP foods", text: "উচ্চ রক্তচাপের জন্য কোন খাবারগুলো এড়ানো উচিত?", emoji: "❤️" },
  { label: "Budget meal plan", text: "৩০০০ টাকার মাসিক বাজেটে একটি পুষ্টিকর খাবারের পরিকল্পনা দিন", emoji: "💰" },
  { label: "Iron-rich foods", text: "বাংলাদেশে কোন খাবারে বেশি আয়রন পাওয়া যায়?", emoji: "💪" },
  { label: "Is fuchka safe?", text: "উচ্চ রক্তচাপে ফুচকা খাওয়া কি নিরাপদ?", emoji: "🥙" },
  { label: "Weight loss tips", text: "বাংলাদেশী খাবার খেয়ে কিভাবে ওজন কমানো যায়?", emoji: "⚖️" },
];

/* ── Voice API helpers ── */
function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
}

function speakText(text: string, lang: "bn-BD" | "en-US" = "bn-BD") {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
  // Strip markdown for cleaner TTS
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/`(.*?)`/g, "$1")
    .slice(0, 500); // Limit TTS to 500 chars for speed
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

/* ── Detect if message has Bengali ── */
function hasBengali(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/* ── Component ── */
export default function NutriBotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "আমি NutriBot — আপনার ব্যক্তিগত পুষ্টি সহকারী! 🌿\n\nআমাকে যেকোনো পুষ্টি বা খাদ্য সম্পর্কিত প্রশ্ন করুন। আপনার স্বাস্থ্য প্রোফাইল ব্যবহার করে আমি ব্যক্তিগতকৃত পরামর্শ দেব।\n\n**Hello!** I'm NutriBot — your personal nutrition assistant for Bangladesh! Ask me anything about food, diet, or nutrition in Bengali or English.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceSupported] = useState(isSpeechRecognitionSupported);
  const [ttsSupported] = useState(isSpeechSynthesisSupported);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Build history for API (exclude welcome message) */
  function buildHistory() {
    return messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));
  }

  /* Send message */
  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim();
    if (!userText || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: buildHistory(),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to get response");
      }

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply!,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Auto-speak if voice output enabled
      if (voiceEnabled && ttsSupported && data.reply) {
        const lang = hasBengali(data.reply) ? "bn-BD" : "en-US";
        speakText(data.reply, lang);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, voiceEnabled, ttsSupported, messages]);

  /* Handle textarea keydown */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  /* Voice input toggle */
  function toggleVoiceInput() {
    if (!voiceSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "bn-BD"; // Bengali (Bangladesh) primary
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: { results: { 0: { 0: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  /* Clear chat */
  function clearChat() {
    window.speechSynthesis?.cancel();
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "আমি NutriBot — আপনার ব্যক্তিগত পুষ্টি সহকারী! 🌿\n\nআমাকে যেকোনো পুষ্টি বা খাদ্য সম্পর্কিত প্রশ্ন করুন। আপনার স্বাস্থ্য প্রোফাইল ব্যবহার করে আমি ব্যক্তিগতকৃত পরামর্শ দেব।\n\n**Hello!** I'm NutriBot — your personal nutrition assistant for Bangladesh! Ask me anything about food, diet, or nutrition in Bengali or English.",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  }

  /* Render message content with basic markdown */
  function renderContent(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
      }
      // Bold inline
      const withBold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p
          key={i}
          className={line === "" ? "h-2" : ""}
          dangerouslySetInnerHTML={{ __html: withBold }}
        />
      );
    });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col mx-auto max-w-3xl gap-0">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border border-b-0 border-[color:var(--border)] bg-gradient-to-r from-[color:var(--primary)]/10 to-emerald-500/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--primary)] to-emerald-500 shadow-lg">
              <Bot size={20} strokeWidth={2} className="text-white" />
            </div>
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[color:var(--surface)] bg-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[color:var(--foreground)]">NutriBot</h2>
            <p className="text-xs text-[color:var(--muted)]">
              Groq · llama-3.3-70b · Bangladeshi nutrition expert
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {ttsSupported && (
            <button
              type="button"
              onClick={() => {
                if (voiceEnabled) window.speechSynthesis?.cancel();
                setVoiceEnabled((v) => !v);
              }}
              title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
              className={[
                "grid h-8 w-8 place-items-center rounded-lg border transition-colors",
                voiceEnabled
                  ? "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 text-[color:var(--primary)]"
                  : "border-[color:var(--border)] text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
              ].join(" ")}
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}
          <button
            type="button"
            onClick={clearChat}
            title="Clear chat"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--border)] text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto border-x border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={["flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row"].join(" ")}
          >
            {/* Avatar */}
            <div
              className={[
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-[color:var(--primary)] to-emerald-500"
                  : "bg-[color:var(--surface-soft)] border border-[color:var(--border)]",
              ].join(" ")}
            >
              {msg.role === "assistant" ? (
                <Bot size={15} strokeWidth={2} className="text-white" />
              ) : (
                <User size={15} strokeWidth={2} className="text-[color:var(--muted)]" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={[
                "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-1",
                msg.role === "assistant"
                  ? "rounded-tl-sm bg-[color:var(--surface-soft)] border border-[color:var(--border)] text-[color:var(--foreground)]"
                  : "rounded-tr-sm bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--primary)]/80 text-white",
              ].join(" ")}
            >
              {renderContent(msg.content)}
              <p
                className={[
                  "mt-2 text-[10px]",
                  msg.role === "assistant" ? "text-[color:var(--muted)]" : "text-white/60",
                ].join(" ")}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex gap-3">
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--primary)] to-emerald-500">
              <Bot size={15} strokeWidth={2} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)]/60 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)]/60 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)]/60 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="border-x border-[color:var(--border)] bg-[color:var(--surface)] px-4 pb-2">
          <p className="mb-2 text-[11px] font-medium text-[color:var(--muted)]">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => sendMessage(p.text)}
                className="flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-xs font-medium text-[color:var(--foreground)] transition-colors hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--primary)]/8 hover:text-[color:var(--primary)]"
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
                <ChevronRight size={10} className="opacity-40" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="rounded-b-2xl border border-t border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Voice input button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? "Stop listening" : "Speak in Bengali or English"}
              className={[
                "mb-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-all",
                isListening
                  ? "animate-pulse border-red-500/40 bg-red-500/10 text-red-500"
                  : "border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--primary)]/40 hover:text-[color:var(--primary)]",
              ].join(" ")}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
          )}

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="আপনার প্রশ্ন লিখুন... (Type in Bengali or English)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-2.5 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-colors"
            style={{ maxHeight: "120px", overflowY: "auto" }}
            disabled={loading}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="mb-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--primary)] to-emerald-500 text-white shadow-md transition-all hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        {/* Status line */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-[color:var(--muted)]">
            <Sparkles size={10} />
            <span>Powered by Groq · llama-3.3-70b-versatile</span>
          </div>
          {isListening && (
            <span className="text-[10px] font-medium text-red-500 animate-pulse">
              🎤 Listening in Bengali...
            </span>
          )}
          {voiceEnabled && !isListening && (
            <span className="text-[10px] text-emerald-500">
              🔊 Voice responses on
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
