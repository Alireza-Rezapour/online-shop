import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { serviceErrorResponse } from "@/lib/errors/service-error";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { orderId } = await params;

  try {
    const items = await prisma.orderItem.findMany({
      where: {
        orderId,
        ...(isAdminSession(session)
          ? {}
          : { order: { userId: session.user.id } }),
      },
    });
    return NextResponse.json(items);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
