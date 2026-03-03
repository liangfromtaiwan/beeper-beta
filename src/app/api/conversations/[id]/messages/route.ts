import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { telegramSendMessage } from "@/lib/telegram";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const conv = await prisma.conversation.findFirst({
    where: { id, account: { userId } },
    include: { account: true },
  });
  if (!conv) return new Response("Not found", { status: 404 });

  const { body } = (await request.json()) as { body?: string };
  if (!body?.trim()) return new Response("Body required", { status: 400 });

  const trimmed = body.trim();
  await prisma.message.create({
    data: {
      conversationId: id,
      body: trimmed,
      fromMe: true,
    },
  });
  await prisma.conversation.update({
    where: { id },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: trimmed,
      unreadCount: 0,
    },
  });

  // 若為 Telegram 對話且已有 externalId（對方 chat_id），真的透過 Telegram API 送出
  if (conv.account.provider === "telegram" && conv.externalId) {
    await telegramSendMessage(conv.externalId, trimmed);
  }

  return new Response(null, { status: 204 });
}
