// app/api/admin/users/[id]/coupons/route.ts
import { requireAdminUser } from "@/lib/api/review-route-utils";
import { getUserCoupons } from "@/services/users/users.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminUser(req);
  const { id } = await params;

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize")) || 10));
  return NextResponse.json(await getUserCoupons(id, page, pageSize));
}
