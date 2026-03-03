import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.focusSettings.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.quickReplyPreset.deleteMany({});
  await prisma.user.deleteMany({});

  const user = await prisma.user.create({
    data: { email: "you@example.com", name: "You" },
  });

  const connectorIds = ["facebook", "instagram", "line", "telegram"] as const;
  const accounts = await Promise.all(
    connectorIds.map((provider) =>
      prisma.account.create({
        data: {
          userId: user.id,
          provider,
          providerId: `mock-${provider}-1`,
          displayName: `${provider} (mock)`,
        },
      })
    )
  );

  const today = new Date();
  today.setHours(10, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const conversationsData = [
    {
      accountId: accounts[0].id,
      title: "Alice Chen",
      externalId: "fb-dm-alice",
      pinned: true,
      muted: false,
      unreadCount: 2,
      lastMessagePreview: "Conference B. See you then!",
      lastMessageAt: new Date(today.getTime() + 2 * 60 * 60 * 1000),
      messages: [
        { body: "Hey, do you have time for a quick sync this afternoon?", fromMe: false, sentAt: new Date(today.getTime()) },
        { body: "Sure, 3pm works. Which room?", fromMe: true, sentAt: new Date(today.getTime() + 15 * 60 * 1000) },
        { body: "Conference B. See you then!", fromMe: false, sentAt: new Date(today.getTime() + 2 * 60 * 60 * 1000) },
      ],
    },
    {
      accountId: accounts[0].id,
      title: "Design Team",
      externalId: "fb-group-design",
      pinned: true,
      muted: false,
      unreadCount: 0,
      lastMessagePreview: "Thanks! Everyone please add feedback in the doc before the call.",
      lastMessageAt: new Date(today.getTime() + 45 * 60 * 1000),
      messages: [
        { body: "Reminder: design review at 2pm today.", fromMe: false, sentAt: new Date(yesterday.getTime() + 14 * 60 * 60 * 1000) },
        { body: "I'll have the Figma links ready.", fromMe: true, sentAt: new Date(today.getTime() + 30 * 60 * 1000) },
        { body: "Thanks! Everyone please add feedback in the doc before the call.", fromMe: false, sentAt: new Date(today.getTime() + 45 * 60 * 1000) },
      ],
    },
    {
      accountId: accounts[1].id,
      title: "Marcus",
      externalId: "ig-dm-marcus",
      pinned: false,
      muted: true,
      unreadCount: 1,
      lastMessagePreview: "Yep, 8pm. I'll bring snacks.",
      lastMessageAt: new Date(today.getTime() + 60 * 60 * 1000),
      messages: [
        { body: "Game night still on for Friday?", fromMe: false, sentAt: new Date(yesterday.getTime() + 20 * 60 * 60 * 1000) },
        { body: "Yep, 8pm. I'll bring snacks.", fromMe: true, sentAt: new Date(today.getTime() + 60 * 60 * 1000) },
      ],
    },
    {
      accountId: accounts[1].id,
      title: "Photo Squad",
      externalId: "ig-group-squad",
      pinned: false,
      muted: false,
      unreadCount: 0,
      lastMessagePreview: "Same here. Saturday 2pm?",
      lastMessageAt: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000),
      messages: [
        { body: "Who's up for the new raid this weekend?", fromMe: false, sentAt: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000) },
        { body: "I'm in!", fromMe: true, sentAt: new Date(yesterday.getTime() + 17 * 60 * 60 * 1000 + 5 * 60 * 1000) },
        { body: "Same here. Saturday 2pm?", fromMe: false, sentAt: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000) },
      ],
    },
    {
      accountId: accounts[2].id,
      title: "Mom",
      externalId: "line-mom",
      pinned: false,
      muted: false,
      unreadCount: 1,
      lastMessagePreview: "I'll be there. What can I bring?",
      lastMessageAt: new Date(today.getTime() + 90 * 60 * 1000),
      messages: [
        { body: "Don't forget dinner on Sunday 💕", fromMe: false, sentAt: new Date(today.getTime() + 80 * 60 * 1000) },
        { body: "I'll be there. What can I bring?", fromMe: true, sentAt: new Date(today.getTime() + 90 * 60 * 1000) },
      ],
    },
    {
      accountId: accounts[2].id,
      title: "Family Group",
      externalId: "line-family",
      pinned: false,
      muted: false,
      unreadCount: 0,
      lastMessagePreview: "Will do tomorrow morning.",
      lastMessageAt: new Date(twoDaysAgo.getTime() + 16 * 60 * 60 * 1000),
      messages: [
        { body: "Can you review the API spec when you get a chance?", fromMe: false, sentAt: new Date(twoDaysAgo.getTime() + 15 * 60 * 60 * 1000) },
        { body: "Will do tomorrow morning.", fromMe: true, sentAt: new Date(twoDaysAgo.getTime() + 16 * 60 * 60 * 1000) },
      ],
    },
    {
      accountId: accounts[3].id,
      title: "Dev Channel",
      externalId: "tg-dev",
      pinned: false,
      muted: false,
      unreadCount: 3,
      lastMessagePreview: "LGTM, merging.",
      lastMessageAt: new Date(today.getTime() + 30 * 60 * 1000),
      messages: [
        { body: "PR is ready for review.", fromMe: false, sentAt: new Date(today.getTime()) },
        { body: "LGTM, merging.", fromMe: true, sentAt: new Date(today.getTime() + 30 * 60 * 1000) },
      ],
    },
    {
      accountId: accounts[3].id,
      title: "Jordan Lee",
      externalId: "tg-dm-jordan",
      pinned: false,
      muted: false,
      unreadCount: 0,
      lastMessagePreview: "Sounds good, talk then.",
      lastMessageAt: new Date(yesterday.getTime() + 19 * 60 * 60 * 1000),
      messages: [
        { body: "Quick call tomorrow 9am?", fromMe: false, sentAt: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000) },
        { body: "Sounds good, talk then.", fromMe: true, sentAt: new Date(yesterday.getTime() + 19 * 60 * 60 * 1000) },
      ],
    },
  ];

  for (const conv of conversationsData) {
    const { messages, ...rest } = conv;
    const created = await prisma.conversation.create({
      data: {
        accountId: rest.accountId,
        externalId: rest.externalId,
        title: rest.title,
        pinned: rest.pinned,
        muted: rest.muted,
        unreadCount: rest.unreadCount,
        lastMessagePreview: rest.lastMessagePreview,
        lastMessageAt: rest.lastMessageAt,
      },
    });
    for (const m of messages) {
      await prisma.message.create({
        data: {
          conversationId: created.id,
          body: m.body,
          fromMe: m.fromMe,
          sentAt: m.sentAt,
        },
      });
    }
  }

  await prisma.quickReplyPreset.createMany({
    data: [
      { label: "👍", body: "👍", sortOrder: 0 },
      { label: "收到", body: "收到", sortOrder: 1 },
      { label: "晚點回你", body: "晚點回你", sortOrder: 2 },
    ],
  });

  await prisma.focusSettings.create({
    data: {
      userId: user.id,
      enabled: false,
      batchSchedule: "11:30,17:30",
    },
  });

  console.log("Seed complete: user, connectors, conversations, messages, presets, focus.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
