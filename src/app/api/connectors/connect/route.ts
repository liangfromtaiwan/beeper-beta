import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONNECTOR_IDS, type ConnectorId } from "@/lib/connectors";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { provider } = (await request.json()) as { provider?: string };
  if (!provider || !CONNECTOR_IDS.includes(provider as ConnectorId))
    return new Response("Invalid provider", { status: 400 });

  const existing = await prisma.account.findFirst({
    where: { userId, provider },
  });

  if (existing) {
    if (existing.disconnectedAt) {
      await prisma.account.update({
        where: { id: existing.id },
        data: { disconnectedAt: null },
      });
    }
  } else {
    await prisma.account.create({
      data: {
        userId,
        provider,
        providerId: `mock-${provider}-${Date.now()}`,
        displayName: `${provider} (mock)`,
      },
    });
  }

  return new Response(null, { status: 204 });
}
