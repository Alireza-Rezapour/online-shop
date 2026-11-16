import { expireStalePaymentsService } from "@/services/payment/paymentExpiry";
import { NextRequest, NextResponse } from "next/server";

// Hit this every few minutes from any scheduler (Vercel Cron, GitHub Actions,
// cron-job.org...) with the header: Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await expireStalePaymentsService());
}
