"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
          發生錯誤
        </h1>
        <p className="mb-4 text-sm text-[var(--muted)]">
          {error.message || "Server-side exception occurred."}
        </p>
        <div className="mb-4 rounded-md bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <p>若部署在 Vercel：SQLite 無法在 serverless 環境使用，請改用 Vercel Postgres 或其它 Postgres，並設定 <code className="rounded bg-[var(--border)] px-1">DATABASE_URL</code>。</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90"
        >
          再試一次
        </button>
      </div>
    </div>
  );
}
