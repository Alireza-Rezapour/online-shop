import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { serviceErrorResponse } from "@/lib/errors/service-error";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string; id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id, orderId } = await params;

  try {
    const item = await prisma.orderItem.findFirst({
      where: {
        id,
        orderId,
        ...(isAdminSession(session)
          ? {}
          : { order: { userId: session.user.id } }),
      },
    });
    if (!item) {
      return NextResponse.json(
        { message: "Order item not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(item);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
