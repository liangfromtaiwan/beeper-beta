import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConversationView } from "./ConversationView";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const conversation = await prisma.conversation.findFirst({
    where: { id, account: { userId, disconnectedAt: null } },
    include: {
      account: true,
      messages: { orderBy: { sentAt: "asc" } },
    },
  });
  if (!conversation) notFound();

  return <ConversationView conversation={conversation} />;
}
