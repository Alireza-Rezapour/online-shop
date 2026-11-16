import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { requireAdmin } from "@/lib/require-admin";
import { updateOrderShippingSchema } from "@/services/order/createOrder.schema";
import { orderInclude } from "@/services/order/order.dto";

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { orderId } = await params;

  try {
    // A customer asking for someone else's order gets the same 404 as a missing one
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(isAdminSession(session) ? {} : { userId: session.user.id }),
      },
      include: orderInclude,
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

// Only the delivery details can be corrected. Status, prices and items have
// their own flows (status route, createOrderService) so they stay consistent.
export async function PUT(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { orderId } = await params;

  try {
    const data = updateOrderShippingSchema.parse(await req.json());

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (!["PENDING", "PAID", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        { message: "The delivery details can no longer be changed." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      await prisma.order.update({ where: { id: orderId }, data }),
    );
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

// Deleting removes the sales record, so only cancelled orders can go
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { orderId } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (order.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Only cancelled orders can be deleted." },
        { status: 400 },
      );
    }

    await prisma.order.delete({ where: { id: orderId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
