import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { reorderLooksSchema } from "@/services/look/look.schema";
import { reorderLooks } from "@/services/look/look.service";

export const PATCH = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  await reorderLooks(reorderLooksSchema.parse(await req.json()));
  revalidatePath("/");
  return NextResponse.json({ success: true });
});
