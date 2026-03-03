const BASE = "https://api.telegram.org/bot";

function getToken(): string | null {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return t || null;
}

export function isTelegramConfigured(): boolean {
  return !!getToken();
}

export async function telegramGetMe(): Promise<{ username: string } | { error: string } | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BASE}${token}/getMe`);
    const data = (await res.json()) as {
      ok?: boolean;
      result?: { username?: string };
      description?: string;
    };
    if (data.ok && data.result?.username) return { username: data.result.username };
    const msg = data.description || (res.ok ? "回應格式錯誤" : `HTTP ${res.status}`);
    return { error: msg };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "連線失敗";
    return { error: msg };
  }
}

export async function telegramSendMessage(chatId: string, text: string): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  const res = await fetch(`${BASE}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { ok?: boolean };
  return data.ok === true;
}

export async function telegramSetWebhook(url: string): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  const res = await fetch(`${BASE}${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { ok?: boolean };
  return data.ok === true;
}
