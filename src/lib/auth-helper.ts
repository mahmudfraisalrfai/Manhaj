// lib/auth-helper.ts
import { auth } from "./auth";

export async function getAuthSession() {
  const session = await auth();
  return session;
}

export async function requireAuth(role?: string) {
  const session = await auth();

  if (!session) {
    throw new Error("غير مصرح - يرجى تسجيل الدخول");
  }

  if (role && session.user.role !== role) {
    throw new Error("غير مصرح - صلاحيات غير كافية");
  }

  return session;
}
