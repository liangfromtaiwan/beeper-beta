"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONNECTOR_LABELS, type ConnectorId } from "@/lib/connectors";

type ConnectorStatus = { id: ConnectorId; connected: boolean };

export function SettingsClient({
  connectorStatus,
  accountIds,
}: {
  connectorStatus: ConnectorStatus[];
  accountIds: Record<string, string>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function handleConnect(provider: ConnectorId) {
    setLoading(provider);
    setTelegramLink(null);
    setTelegramError(null);
    try {
      if (provider === "telegram") {
        const res = await fetch("/api/telegram/connect", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setTelegramError(data.error || "無法取得連結");
          return;
        }
        setTelegramLink(data.link || "");
        router.refresh();
        return;
      }
      await fetch("/api/connectors/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleGetInviteLink() {
    setLoading("telegram-invite");
    setInviteLink(null);
    setTelegramError(null);
    try {
      const res = await fetch("/api/telegram/invite-link", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTelegramError(data.error || "無法取得邀請連結");
        return;
      }
      setInviteLink(data.link || "");
    } finally {
      setLoading(null);
    }
  }

  async function handleDisconnect(provider: ConnectorId, accountId: string) {
    setLoading(provider);
    try {
      await fetch(`/api/accounts/${accountId}/disconnect`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-medium text-[var(--foreground)]">Settings</h1>

      <section>
        <h2 className="mb-3 font-medium text-[var(--foreground)] text-sm">
          Connectors
        </h2>
        <p className="mb-4 text-xs text-[var(--muted)]">
          Telegram 可真正收發訊息，需在環境變數設定 TELEGRAM_BOT_TOKEN 並設定 Webhook。其餘為 mock。
        </p>
        {telegramError && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{telegramError}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {connectorStatus.map(({ id, connected }) => (
            <div
              key={id}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-[var(--foreground)] text-sm">
                  {CONNECTOR_LABELS[id]}
                </span>
                {connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(id, accountIds[id] ?? "")}
                    disabled={loading === id}
                    className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)] disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnect(id)}
                    disabled={loading === id}
                    className="rounded-md bg-[var(--foreground)] px-2.5 py-1.5 text-xs font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-50"
                  >
                    Connect
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] text-[var(--muted)]">
                {connected ? "Connected" : "Not connected"}
              </p>
              {id === "telegram" && connected && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={handleGetInviteLink}
                    disabled={loading === "telegram-invite"}
                    className="text-xs text-[var(--muted)] underline hover:text-[var(--foreground)] disabled:opacity-50"
                  >
                    {inviteLink ? "已產生連結（下方可複製）" : "取得邀請連結（給朋友點）"}
                  </button>
                  {inviteLink && (
                    <p className="mt-1 break-all text-[11px] text-[var(--foreground)]">
                      {inviteLink}
                    </p>
                  )}
                </div>
              )}
              {id === "telegram" && telegramLink && !connected && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <p className="text-[11px] text-[var(--muted)] mb-1">在 Telegram 開啟此連結完成連結：</p>
                  <a
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-xs text-blue-600 dark:text-blue-400 underline"
                  >
                    {telegramLink}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-medium text-[var(--foreground)] text-sm">
          Account
        </h2>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--border)]/50"
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
