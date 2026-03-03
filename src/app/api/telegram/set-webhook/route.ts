import { NextRequest, NextResponse } from "next/server";
import { telegramSetWebhook } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const { url } = (await request.json().catch(() => ({}))) as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "需要 url 參數" }, { status: 400 });
  }
  const ok = await telegramSetWebhook(url);
  return NextResponse.json({ ok });
}
