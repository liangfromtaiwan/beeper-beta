import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/inbox");

  const demoUser = await prisma.user.findFirst();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
          Sign in
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          Demo: sign in with the seeded user to use the inbox.
        </p>
        <LoginForm demoUserId={demoUser?.id ?? null} />
      </div>
    </div>
  );
}
