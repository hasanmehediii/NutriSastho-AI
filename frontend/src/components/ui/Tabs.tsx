"use client";

type Tab = { key: string; label: string };

type TabsProps = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
};

export function Tabs({ tabs, active, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex gap-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={[
            "rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200",
            active === tab.key
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
              : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
