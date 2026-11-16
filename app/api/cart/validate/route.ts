import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { cartValidationSchema } from "@/services/cart/cartValidation.schema";
import { validateCartService } from "@/services/cart/validateCart.service";
import { serviceErrorResponse } from "@/lib/errors/service-error";

// Public: visitors have carts too. A logged-in user additionally gets the
// "already used this coupon" rule applied.
export async function POST(req: NextRequest) {
  try {
    const body = cartValidationSchema.parse(await req.json());
    const session = await getSession();

    return NextResponse.json(
      await validateCartService({ ...body, userId: session?.user.id }),
    );
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
