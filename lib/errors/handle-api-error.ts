import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ApiError, type ApiErrorBody } from "./api-error";
import { groupZodIssues } from "./groupe-zod-issues";

export function handleApiError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof ApiError) {
    return NextResponse.json(error.toResponseBody(), { status: error.status });
  }

  if (error instanceof ZodError) {
    const apiError = zodErrorToApiError(error);
    return NextResponse.json(apiError.toResponseBody(), {
      status: apiError.status,
    });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    const apiError = prismaErrorToApiError(error);
    return NextResponse.json(apiError.toResponseBody(), {
      status: apiError.status,
    });
  }

  console.error(error);
  const apiError = new ApiError({
    code: "INTERNAL_SERVER_ERROR",
    message: "خطای غیرمنتظره‌ای رخ داد. لطفا دوباره تلاش کنید.",
  });
  return NextResponse.json(apiError.toResponseBody(), {
    status: apiError.status,
  });
}

function zodErrorToApiError(error: ZodError): ApiError {
  const { fieldErrors, formErrors } = groupZodIssues(error.issues);
  return new ApiError({
    code: "VALIDATION_ERROR",
    message: "اطلاعات ارسالی معتبر نیست.",
    fieldErrors,
    formErrors,
  });
}

function prismaErrorToApiError(error: PrismaClientKnownRequestError): ApiError {
  if (error.code === "P2002") {
    const target = (error.meta?.target as string[] | undefined) ?? [];
    return new ApiError({
      code: "CONFLICT",
      message: "این مقدار قبلاً استفاده شده است.",
      formErrors: [
        target.length
          ? `مقدار تکراری در: ${target.join(", ")}`
          : "مقدار تکراری.",
      ],
    });
  }
  if (error.code === "P2025") {
    return new ApiError({
      code: "NOT_FOUND",
      message: "رکورد مورد نظر یافت نشد.",
    });
  }
  if (error.code === "P2003") {
    return new ApiError({
      code: "BUSINESS_RULE_ERROR",
      message: "یکی از مقادیر ارجاع داده‌شده معتبر نیست.",
    });
  }
  return new ApiError({ code: "DATABASE_ERROR", message: "خطای پایگاه داده." });
}
