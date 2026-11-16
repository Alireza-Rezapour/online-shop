import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  categoryQuerySchema,
  createCategorySchema,
} from "@/services/category/category.schema";
import {
  createCategoryService,
  getCategoriesService,
} from "@/services/category/category.service";
import { withErrorHandling } from "@/lib/api-handler";

// Public: storefront menus and filters
export const GET = withErrorHandling(async (req: NextRequest) => {
  const query = categoryQuerySchema.parse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  const categories = await getCategoriesService(query);
  return NextResponse.json(categories);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;
  const input = createCategorySchema.parse(await req.json());
  const category = await createCategoryService(input);
  return NextResponse.json(category, { status: 201 });
});
