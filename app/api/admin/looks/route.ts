import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/require-admin";
import { createLookSchema } from "@/services/look/look.schema";
import { createLook, listLooksForAdmin } from "@/services/look/look.service";

export const GET = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  return NextResponse.json(await listLooksForAdmin());
});

export const POST = withErrorHandling(async (req) => {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const input = createLookSchema.parse(await req.json());
  const look = await createLook(input);
  revalidatePath("/"); // the home page renders looks on the server
  return NextResponse.json(look, { status: 201 });
});
