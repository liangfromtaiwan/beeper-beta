"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Conversation, Message, Account } from "@prisma/client";
import { PlatformBadge } from "@/components/PlatformBadge";

const QUICK_REPLIES = [
  { label: "👍", body: "👍" },
  { label: "收到", body: "收到" },
  { label: "晚點回你", body: "晚點回你" },
] as const;

type ConvWithMessages = Conversation & {
  account: Account;
  messages: Message[];
};

export function ConversationView({ conversation }: { conversation: ConvWithMessages }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/conversations/${conversation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markRead: true }),
    }).catch(() => {});
  }, [conversation.id]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    setSending(true);
    setJustSent(false);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      if (res.ok) {
        setBody("");
        setJustSent(true);
        router.refresh();
      } else {
        const msg = res.status === 401 ? "請先登入" : res.status === 404 ? "找不到對話" : res.status === 400 ? "請輸入訊息內容" : `無法寄出 (${res.status})`;
        setError(msg);
      }
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(body);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(body);
    }
  }

  const grouped = groupMessagesByDate(conversation.messages);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <header className="shrink-0 border-b border-[var(--border)] pb-3 mb-3">
        <Link
          href="/inbox"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] no-underline mb-2 inline-block"
        >
          ← Back to inbox
        </Link>
        <h1 className="text-lg font-medium text-[var(--foreground)]">
          {conversation.title}
        </h1>
        <PlatformBadge provider={conversation.account.provider} />
      </header>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[var(--muted)]">No messages yet</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Send a message below to start the conversation.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, messages]) => (
            <section key={dateLabel}>
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]" suppressHydrationWarning>
                  {dateLabel}
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>
              <ul className="space-y-2 mt-2">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        m.fromMe
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--border)] text-[var(--foreground)]"
                      }`}
                    >
                      {m.body}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <div className="shrink-0 pt-4 border-t border-[var(--border)] space-y-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_REPLIES.map(({ label, body: presetBody }) => (
            <button
              key={label}
              type="button"
              onClick={() => sendMessage(presetBody)}
              disabled={sending}
              className="rounded-full border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Reply… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="min-h-[40px] max-h-32 flex-1 resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="shrink-0 rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-50 h-[40px]"
          >
            {sending ? "…" : "Send"}
          </button>
        </form>
        {justSent && (
          <p className="text-xs text-[var(--muted)]">
            已送出。{" "}
            <Link href="/inbox" className="underline hover:text-[var(--foreground)]">
              返回 Inbox
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};
  for (const m of messages) {
    const d = new Date(m.sentAt);
    const key =
      isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : d.toLocaleDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return groups;
}

function isToday(d: Date): boolean {
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

function isYesterday(d: Date): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getDate() === y.getDate() &&
    d.getMonth() === y.getMonth() &&
    d.getFullYear() === y.getFullYear()
  );
}
