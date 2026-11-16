import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { updateLookSchema } from "@/services/look/look.schema";
import {
  deleteLook,
  getLookByIdForAdmin,
  updateLook,
} from "@/services/look/look.service";

// NOTE: adjust the context type if withErrorHandling passes params differently
type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (req, { params }: Ctx) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  return NextResponse.json(await getLookByIdForAdmin(id));
});

export const PUT = withErrorHandling(async (req, { params }: Ctx) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const input = updateLookSchema.parse(await req.json());
  const look = await updateLook(id, input);
  revalidatePath("/");
  return NextResponse.json(look);
});

export const DELETE = withErrorHandling(async (req, { params }: Ctx) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  await deleteLook(id);
  revalidatePath("/");
  return NextResponse.json({ success: true });
});
