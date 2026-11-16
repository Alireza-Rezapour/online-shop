// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listUsers } from "@/services/users/users.service";
import { requireAdminUser } from "@/lib/api/review-route-utils";

export async function GET(req: NextRequest) {
  await requireAdminUser(req);

  const sp = req.nextUrl.searchParams;
  const role = sp.get("role");
  const banned = sp.get("banned");

  const result = await listUsers({
    search: sp.get("search") ?? undefined,
    role: role === "admin" || role === "user" ? role : undefined,
    banned: banned === "true" ? true : banned === "false" ? false : undefined,
    page: Math.max(1, Number(sp.get("page")) || 1),
    pageSize: Math.min(100, Math.max(1, Number(sp.get("pageSize")) || 20)),
  });
  return NextResponse.json(result);
}
