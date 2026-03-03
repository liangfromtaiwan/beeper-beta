import { NextRequest } from "next/server";
import { setUserCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { userId } = (await request.json()) as { userId?: string };
  if (!userId) return new Response("Missing userId", { status: 400 });
  await setUserCookie(userId);
  return new Response(null, { status: 204 });
}
