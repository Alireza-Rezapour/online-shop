import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";
import { toggleFavoriteService } from "@/services/favorite/toggleFavorite.service";
import { serviceErrorResponse } from "@/lib/errors/service-error";

const bodySchema = z.object({ productId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorizedResponse();

  try {
    const { productId } = bodySchema.parse(await req.json());
    return NextResponse.json(
      await toggleFavoriteService(session.user.id, productId),
    );
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
