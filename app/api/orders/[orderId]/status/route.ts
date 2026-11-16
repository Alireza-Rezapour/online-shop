import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getSession, isAdminSession } from "@/lib/session";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { cancelOrderService } from "@/services/order/cancelOrder.service";
import { updateOrderStatusService } from "@/services/order/updateOrder.service";
import { serviceErrorResponse } from "@/lib/errors/service-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  try {
    const { status } = await req.json();

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Admins can cancel any order that has not shipped; a customer can only
    // cancel their own unpaid order (enforced inside the service)
    if (status === "CANCELLED") {
      const session = await getSession();
      if (!session) return unauthorizedResponse();

      const order = await cancelOrderService(orderId, {
        userId: session.user.id,
        isAdmin: isAdminSession(session),
      });
      return NextResponse.json(order);
    }

    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;

    return NextResponse.json(
      await updateOrderStatusService({ orderId, status }),
    );
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
