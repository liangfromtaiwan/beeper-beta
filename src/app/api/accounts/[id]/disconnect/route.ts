import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const account = await prisma.account.findFirst({
    where: { id, userId },
  });
  if (!account) return new Response("Not found", { status: 404 });

  await prisma.account.update({
    where: { id },
    data: { disconnectedAt: new Date() },
  });

  return new Response(null, { status: 204 });
}
