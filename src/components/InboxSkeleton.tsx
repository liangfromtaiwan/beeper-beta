export function InboxSkeleton() {
  return (
    <div className="space-y-0">
      <div className="mb-4 h-6 w-24 animate-pulse rounded bg-[var(--border)]" />
      <ul className="divide-y divide-[var(--border)]">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 py-2">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--border)]" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 animate-pulse rounded bg-[var(--border)]" />
                <div className="h-4 w-14 animate-pulse rounded bg-[var(--border)]" />
              </div>
              <div className="h-3.5 w-full max-w-[200px] animate-pulse rounded bg-[var(--border)]/70" />
            </div>
            <div className="h-3.5 w-10 shrink-0 animate-pulse rounded bg-[var(--border)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
