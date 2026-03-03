import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTelegramConfigured, telegramGetMe } from "@/lib/telegram";

function randomCode(length: number): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "請先登入" }, { status: 401 });

  if (!isTelegramConfigured())
    return NextResponse.json({ error: "尚未設定 TELEGRAM_BOT_TOKEN" }, { status: 503 });

  const bot = await telegramGetMe();
  if (!bot) return NextResponse.json({ error: "無法取得 Bot 資訊（請檢查 TELEGRAM_BOT_TOKEN）" }, { status: 503 });
  if ("error" in bot) return NextResponse.json({ error: `無法取得 Bot 資訊：${bot.error}` }, { status: 503 });

  const code = "connect_" + randomCode(8);
  await prisma.telegramLinkCode.create({
    data: { code, userId, type: "connect" },
  });

  const link = `https://t.me/${bot.username}?start=${code}`;
  return NextResponse.json({ link, botUsername: bot.username });
}
