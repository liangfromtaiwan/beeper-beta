import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const USER_COOKIE = "beeper_user_id";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(USER_COOKIE)?.value ?? null;
  return id;
}

export async function getCurrentUser() {
  try {
    const id = await getCurrentUserId();
    if (!id) return null;
    return await prisma.user.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function setUserCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
}
