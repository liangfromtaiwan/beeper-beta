"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ demoUserId }: { demoUserId: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!demoUserId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: demoUserId }),
      });
      if (res.ok) router.push("/inbox");
      else throw new Error("Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (!demoUserId) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Run <code className="rounded bg-[var(--border)] px-1">npm run db:seed</code> first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[var(--foreground)] py-2.5 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in (demo)"}
      </button>
    </form>
  );
}
