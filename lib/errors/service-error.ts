import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { handlePrismaError } from "./api-error";

export function serviceErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: error.issues[0]?.message ?? "Invalid input",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  // Raw Prisma errors have unfriendly messages, let the existing handler map them
  if (error instanceof Error && error.name.startsWith("PrismaClient")) {
    return handlePrismaError(error);
  }

  if (!(error instanceof Error)) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }

  const status = error.message.toLowerCase().includes("not found") ? 404 : 400;
  return NextResponse.json({ error: error.message }, { status });
}
