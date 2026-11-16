import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-handler";
import { updateAddressSchema } from "@/services/address/address.schema";
import {
  deleteAddress,
  updateAddress,
} from "@/services/address/address.service";
import { getSession } from "@/lib/session";
import { unauthorizedResponse } from "@/lib/errors/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling<{ id: string }>(
  async (req, { params }: Ctx) => {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    const { id } = await params;
    const input = updateAddressSchema.parse(await req.json());
    return NextResponse.json(await updateAddress(session.user.id, id, input));
  },
);

export const DELETE = withErrorHandling<{ id: string }>(
  async (req, { params }: Ctx) => {
    const session = await getSession();
    if (!session) return unauthorizedResponse();
    const { id } = await params;
    await deleteAddress(session.user.id, id);
    return NextResponse.json({ success: true });
  },
);
