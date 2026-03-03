"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Conversation, Account } from "@prisma/client";
import { PlatformBadge } from "@/components/PlatformBadge";

type ConvWithAccount = Conversation & { account: Account };

function formatTime(d: Date): string {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function InboxList({ conversations }: { conversations: ConvWithAccount[] }) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleAction(convId: string, action: "pin" | "mute" | "read") {
    if (updating) return;
    setUpdating(convId);
    try {
      const conv = conversations.find((c) => c.id === convId);
      const body =
        action === "pin"
          ? { pinned: !conv?.pinned }
          : action === "mute"
            ? { muted: !conv?.muted }
            : { markRead: true };
      const res = await fetch(`/api/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    } finally {
      setUpdating(null);
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 py-16 px-6 text-center">
        <p className="text-[var(--muted)] text-sm">No conversations yet</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Connect accounts in Settings to see messages here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)]">
      {conversations.map((c) => (
        <li
          key={c.id}
          className="group relative flex items-center gap-3 py-2 pr-2"
        >
          <Link
            href={`/conversation/${c.id}`}
            className="absolute inset-0 z-0 flex items-center gap-3 py-2 no-underline"
            aria-label={`Open conversation with ${c.title}`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--border)] text-[11px] font-medium text-[var(--foreground)]"
              aria-hidden
            >
              {c.title.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-[var(--foreground)] text-sm">
                  {c.title}
                </span>
                <PlatformBadge provider={c.account.provider} />
                {c.pinned && (
                  <span className="text-[var(--muted)]" title="Pinned">📌</span>
                )}
                {c.muted && (
                  <span className="text-[var(--muted)]" title="Muted">🔇</span>
                )}
              </div>
              <p className="truncate text-[11px] text-[var(--muted)] mt-0.5">
                {c.lastMessagePreview || "No messages"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {c.unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--foreground)] px-1.5 text-[10px] font-medium text-[var(--background)]">
                  {c.unreadCount > 99 ? "99+" : c.unreadCount}
                </span>
              )}
              <time
                dateTime={c.lastMessageAt.toISOString()}
                className="text-[11px] text-[var(--muted)]"
                suppressHydrationWarning
              >
                {formatTime(c.lastMessageAt)}
              </time>
            </div>
          </Link>
          <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAction(c.id, "pin");
              }}
              disabled={updating === c.id}
              className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] disabled:opacity-50 text-xs"
              title={c.pinned ? "Unpin" : "Pin"}
            >
              📌
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAction(c.id, "mute");
              }}
              disabled={updating === c.id}
              className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] disabled:opacity-50 text-xs"
              title={c.muted ? "Unmute" : "Mute"}
            >
              🔇
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAction(c.id, "read");
              }}
              disabled={updating === c.id || c.unreadCount === 0}
              className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] disabled:opacity-50 text-xs"
              title="Mark as read"
            >
              ✓
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
