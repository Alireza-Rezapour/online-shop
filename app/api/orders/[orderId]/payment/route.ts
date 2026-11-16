import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { createPaymentService } from "@/services/payment/createPayment.service";

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { orderId } = await params;

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        ...(isAdminSession(session)
          ? {}
          : { order: { userId: session.user.id } }),
      },
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

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { orderId } = await params;

  try {
    const payment = await createPaymentService({
      orderId,
      userId: session.user.id,
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
