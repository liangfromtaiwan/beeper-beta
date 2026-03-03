import { Suspense } from "react";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InboxSkeleton } from "@/components/InboxSkeleton";
import { InboxList } from "./InboxList";

async function InboxContent() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const conversations = await prisma.conversation.findMany({
    where: { account: { userId, disconnectedAt: null } },
    include: { account: true },
    orderBy: [{ pinned: "desc" }, { lastMessageAt: "desc" }],
  });

  return (
    <>
      <h1 className="mb-4 text-lg font-medium text-[var(--foreground)]">
        Inbox
      </h1>
      <InboxList conversations={conversations} />
    </>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxSkeleton />}>
      <InboxContent />
    </Suspense>
  );
}
