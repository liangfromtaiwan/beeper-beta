import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const conv = await prisma.conversation.findFirst({
    where: { id, account: { userId, disconnectedAt: null } },
  });
  if (!conv) return new Response("Not found", { status: 404 });

  const body = (await request.json()) as {
    pinned?: boolean;
    muted?: boolean;
    markRead?: boolean;
  };

  const updates: { pinned?: boolean; muted?: boolean; unreadCount?: number } = {};
  if (typeof body.pinned === "boolean") updates.pinned = body.pinned;
  if (typeof body.muted === "boolean") updates.muted = body.muted;
  if (body.markRead) updates.unreadCount = 0;

  if (Object.keys(updates).length === 0)
    return new Response(null, { status: 204 });

  await prisma.conversation.update({
    where: { id },
    data: updates,
  });

  return new Response(null, { status: 204 });
}
