import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const profile = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;
  const profile = await prisma.user.update({
    where: {
      id,
    },
    data: {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      name: `${body.firstName} ${body.lastName}`,
      birthDate: body.birthday,
      gender: body.gender,
    },
  });

  return NextResponse.json(profile);
}
