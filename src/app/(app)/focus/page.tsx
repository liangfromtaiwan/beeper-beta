import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FocusPageClient } from "./FocusPageClient";

export default async function FocusPage() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const focus = await prisma.focusSettings.findUnique({
    where: { userId },
  });

  const mutedConversations = await prisma.conversation.findMany({
    where: {
      account: { userId, disconnectedAt: null },
      muted: true,
    },
    include: { account: true },
    orderBy: { lastMessageAt: "desc" },
  });

  const morning = focus?.batchSchedule?.split(",")[0]?.trim() ?? "11:30";
  const afternoon = focus?.batchSchedule?.split(",")[1]?.trim() ?? "17:30";

  return (
    <FocusPageClient
      enabled={focus?.enabled ?? false}
      morningTime={morning}
      afternoonTime={afternoon}
      mutedConversations={mutedConversations}
    />
  );
}
