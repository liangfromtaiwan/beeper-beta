import { clearUserCookie } from "@/lib/auth";

export async function POST() {
  await clearUserCookie();
  return new Response(null, { status: 204 });
}
