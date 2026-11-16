import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { updateCategorySchema } from "@/services/category/category.schema";
import {
  deleteCategoryService,
  getCategoryByIdService,
  updateCategoryService,
} from "@/services/category/category.service";
import { withErrorHandling } from "@/lib/api-handler";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const { id } = await params;
    return NextResponse.json(await getCategoryByIdService(id));
  },
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    const input = updateCategorySchema.parse(await req.json());
    return NextResponse.json(await updateCategoryService(id, input));
  },
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const guard = await requireAdmin(req);
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    return NextResponse.json(await deleteCategoryService(id));
  },
);
