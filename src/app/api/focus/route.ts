import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as {
    enabled?: boolean;
    batchSchedule?: string;
  };

  await prisma.focusSettings.upsert({
    where: { userId },
    update: {
      ...(typeof body.enabled === "boolean" && { enabled: body.enabled }),
      ...(body.batchSchedule !== undefined && { batchSchedule: body.batchSchedule }),
    },
    create: {
      userId,
      enabled: body.enabled ?? false,
      batchSchedule: body.batchSchedule ?? "11:30,17:30",
    },
  });

  return new Response(null, { status: 204 });
}
