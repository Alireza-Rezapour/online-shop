import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import {
  createCarrier,
  listCarriers,
} from "@/services/carrier/carrier.service";
import { createCarrierSchema } from "@/services/carrier/carrier.schema";

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listCarriers());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const input = createCarrierSchema.parse(await req.json());
  return NextResponse.json(await createCarrier(input), { status: 201 });
});
