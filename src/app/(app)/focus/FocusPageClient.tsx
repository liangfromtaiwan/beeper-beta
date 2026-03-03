"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Conversation, Account } from "@prisma/client";
import { PlatformBadge } from "@/components/PlatformBadge";

type ConvWithAccount = Conversation & { account: Account };

export function FocusPageClient({
  enabled: initialEnabled,
  morningTime: initialMorning,
  afternoonTime: initialAfternoon,
  mutedConversations,
}: {
  enabled: boolean;
  morningTime: string;
  afternoonTime: string;
  mutedConversations: ConvWithAccount[];
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [morning, setMorning] = useState(initialMorning);
  const [afternoon, setAfternoon] = useState(initialAfternoon);
  const [saving, setSaving] = useState(false);
  const [unmuting, setUnmuting] = useState<string | null>(null);

  async function handleToggle() {
    setSaving(true);
    try {
      await fetch("/api/focus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      setEnabled(!enabled);
    } finally {
      setSaving(false);
    }
  }

  async function handleScheduleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/focus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchSchedule: `${morning},${afternoon}` }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleUnmute(convId: string) {
    if (unmuting) return;
    setUnmuting(convId);
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muted: false }),
      });
      if (res.ok) router.refresh();
    } finally {
      setUnmuting(null);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-medium text-[var(--foreground)]">Focus</h1>

      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium text-[var(--foreground)] text-sm">
              Focus mode
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Notifications are batched to your schedule (mock).
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={handleToggle}
            disabled={saving}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              enabled ? "bg-[var(--foreground)]" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-[var(--background)] transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-medium text-[var(--foreground)] text-sm">
          Batching schedule (mock)
        </h2>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Morning and afternoon batch times. Not connected to real delivery.
        </p>
        <form onSubmit={handleScheduleSave} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Morning</span>
            <input
              type="text"
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
              placeholder="11:30"
              className="w-24 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--muted)]">Afternoon</span>
            <input
              type="text"
              value={afternoon}
              onChange={(e) => setAfternoon(e.target.value)}
              placeholder="17:30"
              className="w-24 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-50 h-[38px]"
          >
            Save
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-medium text-[var(--foreground)] text-sm">
          Muted conversations
        </h2>
        {mutedConversations.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">No muted conversations.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {mutedConversations.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between py-2.5 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--foreground)] text-sm">
                    {c.title}
                  </p>
                  <PlatformBadge provider={c.account.provider} />
                </div>
                <button
                  type="button"
                  onClick={() => handleUnmute(c.id)}
                  disabled={unmuting === c.id}
                  className="shrink-0 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--border)]/50 disabled:opacity-50"
                >
                  Unmute
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
