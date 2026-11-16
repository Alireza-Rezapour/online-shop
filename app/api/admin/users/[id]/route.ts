// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getUserOverview,
  UserNotFoundError,
} from "@/services/users/users.service";
import { requireAdminUser } from "@/lib/api/review-route-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminUser(req);

  const { id } = await params;

  try {
    return NextResponse.json(await getUserOverview(id));
  } catch (e) {
    if (e instanceof UserNotFoundError)
      return NextResponse.json({ error: e.message }, { status: 404 });
    throw e;
  }
}
