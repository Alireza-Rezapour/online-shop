import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export type AppSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;

// better-auth's admin plugin can store several roles as "admin,user"
export function isAdminSession(session: AppSession): boolean {
  const role = session.user.role;
  return !!role && role.split(",").some((r) => r.trim() === "admin");
}
