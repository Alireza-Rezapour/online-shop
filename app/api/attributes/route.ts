import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAttributeSchema } from "@/services/attribute/attribute.schema";
import {
  createAttributeService,
  getAttributesService,
} from "@/services/attribute/attribute.service";
import { withErrorHandling } from "@/lib/api-handler";

// Public: storefront filters and product pages
export const GET = withErrorHandling(async () => {
  return NextResponse.json(await getAttributesService());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;
  const input = createAttributeSchema.parse(await req.json());
  return NextResponse.json(await createAttributeService(input), {
    status: 201,
  });
});
