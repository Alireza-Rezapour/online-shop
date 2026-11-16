import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdminSession } from "@/lib/session";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import { serviceErrorResponse } from "@/lib/errors/service-error";
import { createOrderSchema } from "@/services/order/createOrder.schema";
import { createOrderService } from "@/services/order/createOrder.service";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { orderInclude } from "@/services/order/order.dto";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const admin = isAdminSession(session);

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    if (status && !Object.values(OrderStatus).includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const where = {
      ...(status && { status: status as OrderStatus }),
      // Customers only ever see their own orders; only admins may filter by user
      ...(admin ? (userId ? { userId } : {}) : { userId: session.user.id }),
    };

    const pageParam = searchParams.get("page");

    // Not paginated: legacy behavior, plain array
    if (pageParam === null) {
      const orders = await prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(orders);
    }

    const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("pageSize") ?? "", 10) || 20,
      ),
    );

    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: orderInclude,
        // id as tie-breaker keeps pages stable when createdAt values collide
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const body = createOrderSchema.parse(await req.json());

    const order = await createOrderService({
      userId: session.user.id,
      items: body.items,
      shippingAddress: {
        receiverName: body.shippingReceiverName,
        phone: body.shippingPhone,
        province: body.shippingProvince,
        city: body.shippingCity,
        address: body.shippingAddress,
        postalCode: body.shippingPostalCode,
      },
      shippingCarrierId: body.shippingCarrierId,
      couponCode: body.couponCode,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
