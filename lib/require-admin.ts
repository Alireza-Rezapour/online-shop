import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}
