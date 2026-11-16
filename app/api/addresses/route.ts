// /app/api/addresses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import {
  createAddress,
  listAddresses,
} from "@/services/address/address.service";
import { createAddressSchema } from "@/services/address/address.schema";
import { getSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  return NextResponse.json(await listAddresses(session.user.id));
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  const input = createAddressSchema.parse(await req.json());
  return NextResponse.json(await createAddress(session.user.id, input), {
    status: 201,
  });
});
