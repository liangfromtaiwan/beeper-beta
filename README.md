# Inbox — distraction-free unified inbox MVP

A minimal web app for **reading and replying** to messages only. No feeds, no explore, no infinite scroll.

## Tech

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite**
- Mock connectors only (no external APIs)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` (or keep the default `DATABASE_URL="file:./dev.db"`).

3. **Database**

   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in with the demo user to see the seeded inbox.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Demo sign-in; landing after login is `/inbox` |
| `/inbox` | Unified list: avatar, name, platform badge, last message preview, time, unread count; row actions Pin/Unpin, Mute/Unmute, Mark as read; sorted pinned first, then lastMessageAt desc |
| `/conversation/[id]` | Messages by date, quick replies (👍, 收到, 晚點回你), Enter to send / Shift+Enter newline; after send → redirect to `/inbox` with optional "Stay on this conversation" |
| `/focus` | Focus mode toggle (DB), batching schedule morning 11:30 / afternoon 17:30 (mock), muted conversations list with Unmute |
| `/settings` | Connectors (Facebook, Instagram, LINE, Telegram) as cards; Connect/Disconnect (mock); connection status in DB; sign out |

## Scripts

- `npm run dev` — start dev server
- `npm run build` — Prisma generate + Next.js build
- `npm run start` — start production server
- `npm run db:push` — push Prisma schema to SQLite
- `npm run db:seed` — seed user, accounts, conversations, messages, presets

## Seed data

- One user: `you@example.com`
- Four connectors: Facebook, Instagram, LINE, Telegram (all connected)
- Eight conversations with last message preview, unread counts, some pinned/muted
- Focus settings with batch schedule 11:30, 17:30

## Telegram 真正收發訊息

要讓 Telegram 真的能寄信給朋友，需要：

1. **建立 Bot**  
   在 Telegram 找 [@BotFather](https://t.me/BotFather)，送 `/newbot`，依指示建立 Bot，取得 **Token**。

2. **設定環境變數**  
   在 `.env` 加上：
   ```env
   TELEGRAM_BOT_TOKEN=你的Bot_Token
   ```

3. **設定 Webhook**（讓 Telegram 把新訊息轉到你的伺服器）  
   - 本機開發：用 [ngrok](https://ngrok.com/) 等把 `https://你的網址/api/telegram/webhook` 暴露出去。  
   - 然後呼叫：
     ```bash
     curl -X POST http://localhost:3000/api/telegram/set-webhook \
       -H "Content-Type: application/json" \
       -d '{"url":"https://你的ngrok網址/api/telegram/webhook"}'
     ```
   - 正式環境：把 `url` 設成你正式網域的 `https://你的網域/api/telegram/webhook` 再呼叫上述 API。

4. **在 App 裡連結 Telegram**  
   - 設定 → 點 Telegram 的 **Connect** → 畫面上會出現連結。  
   - 在 Telegram 開啟該連結並送出一開始的 `/start`，即完成「連結帳號」。

5. **加朋友為聯絡人**  
   - 連結成功後，同一個設定卡片會出現 **「取得邀請連結（給朋友點）」**。  
   - 點下去取得連結，把連結傳給朋友。  
   - 朋友在 Telegram 點連結並送出一開始的 `/start`，就會加入你的 Inbox 成為一則對話。  
   - 之後朋友在 Telegram 傳給你的 Bot 的訊息會出現在 Inbox，你在 Inbox 回覆會真的透過 Telegram 寄給對方。

## Constraints

- **Not a social platform** — read and reply only; after sending a reply the app redirects to `/inbox`.
- **No feeds, explore, or infinite scroll** — interface stays minimal and calm.
