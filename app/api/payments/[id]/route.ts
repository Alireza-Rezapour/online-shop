import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { paymentWithOrderInclude } from "@/services/payment/payment.dto";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        ...(isAdminSession(session)
          ? {}
          : { order: { userId: session.user.id } }),
      },
      include: paymentWithOrderInclude,
    });
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(payment);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

// A payment record is financial history; only a failed attempt can be removed
// (a PENDING one still holds a stock reservation, a SUCCESS one is a sale)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { status: true, orderId: true },
    });
    if (!payment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 },
      );
    }
    if (payment.status !== "FAILED") {
      return NextResponse.json(
        { error: "Only failed payments can be deleted." },
        { status: 400 },
      );
    }

    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ id, orderId: payment.orderId });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
