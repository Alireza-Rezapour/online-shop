import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdminSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { verifyPaymentService } from "@/services/payment/verifyPaymentService";
import { serviceErrorResponse } from "@/lib/errors/service-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  try {
    const { status } = await req.json();

    // Anything else (e.g. REFUNDED) used to be silently treated as a failure
    if (status !== "SUCCESS" && status !== "FAILED") {
      return NextResponse.json(
        { error: "status must be SUCCESS or FAILED" },
        { status: 400 },
      );
    }

    const payment = await verifyPaymentService({
      paymentId: id,
      success: status === "SUCCESS",
      actor: { userId: session.user.id, isAdmin: isAdminSession(session) },
    });
    return NextResponse.json(payment);
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
