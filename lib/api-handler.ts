// /lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "./generated/prisma/client";
import { AppError } from "./errors/errors";

type RouteContext<T extends Record<string, string> = Record<string, string>> = {
  params: Promise<T>;
};
type Handler<T extends Record<string, string> = Record<string, string>> = (
  req: NextRequest,
  ctx: RouteContext<T>,
) => Promise<NextResponse>;

export function withErrorHandling<
  T extends Record<string, string> = Record<string, string>,
>(handler: Handler<T>): Handler<T> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "داده ارسالی نامعتبر است",
        code: "VALIDATION_ERROR",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "این مقدار قبلاً استفاده شده است", code: "UNIQUE_CONSTRAINT" },
        { status: 409 },
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "این آیتم به رکورد دیگری وابسته است و قابل حذف/ویرایش نیست",
          code: "FK_CONSTRAINT",
        },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "رکورد مورد نظر یافت نشد", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
  }

  console.error(error);
  return NextResponse.json(
    { error: "خطای غیرمنتظره سرور", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
