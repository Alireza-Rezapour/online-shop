import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { PaymentStatus } from "@/lib/generated/prisma/enums";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { paymentWithOrderInclude } from "@/services/payment/payment.dto";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  try {
    const status = new URL(req.url).searchParams.get("status");

    if (
      status &&
      !Object.values(PaymentStatus).includes(status as PaymentStatus)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const payments = await prisma.payment.findMany({
      where: { ...(status && { status: status as PaymentStatus }) },
      include: paymentWithOrderInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
