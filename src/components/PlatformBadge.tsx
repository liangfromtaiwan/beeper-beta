const LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  line: "LINE",
  telegram: "Telegram",
};

export function PlatformBadge({ provider }: { provider: string }) {
  const label = LABELS[provider] ?? provider;
  return (
    <span className="inline-flex shrink-0 items-center rounded bg-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
      {label}
    </span>
  );
}
