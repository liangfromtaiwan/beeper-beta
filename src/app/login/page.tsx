import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/inbox");

  let demoUserId: string | null = null;
  let dbError = false;
  try {
    const demoUser = await prisma.user.findFirst();
    demoUserId = demoUser?.id ?? null;
  } catch {
    dbError = true;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
          Sign in
        </h1>
        {dbError ? (
          <div className="mb-6 rounded-md bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            <p className="font-medium">資料庫無法連線</p>
            <p className="mt-1 text-xs">
              部署到 Vercel 時請使用 Vercel Postgres（或其它 Postgres），在專案設定中加上環境變數 <code className="rounded bg-[var(--border)] px-1">DATABASE_URL</code>，並在 Build 前執行 <code className="rounded bg-[var(--border)] px-1">prisma db push</code> 與 seed。
            </p>
          </div>
        ) : (
          <p className="mb-6 text-sm text-[var(--muted)]">
            Demo: sign in with the seeded user to use the inbox.
          </p>
        )}
        <LoginForm demoUserId={demoUserId} />
      </div>
    </div>
  );
}
