import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TelegramUpdate = {
  message?: {
    chat: { id: number; type: string };
    from?: { id: number; first_name?: string; username?: string };
    text?: string;
  };
};

export async function POST(request: NextRequest) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: TelegramUpdate;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = body.message;
  if (!message?.chat?.id || !message.text) {
    return new NextResponse(null, { status: 200 });
  }

  const chatId = String(message.chat.id);
  const text = message.text.trim();
  const fromName = [message.from?.first_name, message.from?.username].filter(Boolean).join(" ") || "Telegram";

  // /start 參數：連結帳號或加入為聯絡人
  if (text.startsWith("/start ")) {
    const param = text.slice(7).trim();
    if (param.startsWith("connect_")) {
      const link = await prisma.telegramLinkCode.findUnique({
        where: { code: param, type: "connect" },
      });
      if (link?.userId) {
        const existing = await prisma.account.findFirst({
          where: { userId: link.userId, provider: "telegram" },
        });
        if (existing) {
          await prisma.account.update({
            where: { id: existing.id },
            data: { providerId: chatId, disconnectedAt: null, displayName: `Telegram (${fromName})` },
          });
        } else {
          await prisma.account.create({
            data: {
              userId: link.userId,
              provider: "telegram",
              providerId: chatId,
              displayName: `Telegram (${fromName})`,
            },
          });
        }
        await prisma.telegramLinkCode.deleteMany({ where: { code: param } });
      }
    } else if (param.startsWith("inv_")) {
      const link = await prisma.telegramLinkCode.findUnique({
        where: { code: param, type: "invite" },
      });
      if (link?.accountId) {
        const existing = await prisma.conversation.findFirst({
          where: { accountId: link.accountId, externalId: chatId },
        });
        if (!existing) {
          await prisma.conversation.create({
            data: {
              accountId: link.accountId,
              externalId: chatId,
              title: fromName,
              lastMessagePreview: null,
            },
          });
        }
        await prisma.telegramLinkCode.deleteMany({ where: { code: param } });
      }
    }
    return new NextResponse(null, { status: 200 });
  }

  // 一般訊息：找出 externalId = chatId 的對話並寫入 Message
  const conversations = await prisma.conversation.findMany({
    where: { externalId: chatId },
    select: { id: true },
  });
  for (const c of conversations) {
    await prisma.message.create({
      data: {
        conversationId: c.id,
        body: text,
        fromMe: false,
      },
    });
    await prisma.conversation.update({
      where: { id: c.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: text.slice(0, 200),
        unreadCount: { increment: 1 },
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
