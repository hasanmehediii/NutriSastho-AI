"use client";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm font-semibold text-[color:var(--muted)] shadow-sm">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--primary)]/25 border-t-[color:var(--primary)]" />
      <span>{label}</span>
    </div>
  );
}
