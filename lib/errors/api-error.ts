import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BUSINESS_RULE_ERROR"
  | "DATABASE_ERROR"
  | "INTERNAL_SERVER_ERROR";

export interface ApiErrorBody {
  success: false;
  code: ApiErrorCode;
  message: string;
  errors: {
    fieldErrors: Record<string, string[]>;
    formErrors: string[];
  };
}

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  BUSINESS_RULE_ERROR: 422,
  DATABASE_ERROR: 500,
  INTERNAL_SERVER_ERROR: 500,
};

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  fieldErrors: Record<string, string[]>;
  formErrors: string[];

  constructor(params: {
    code: ApiErrorCode;
    message: string;
    status?: number;
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.status = params.status ?? STATUS_BY_CODE[params.code];
    this.fieldErrors = params.fieldErrors ?? {};
    this.formErrors = params.formErrors ?? [];
  }

  toResponseBody(): ApiErrorBody {
    return {
      success: false,
      code: this.code,
      message: this.message,
      errors: { fieldErrors: this.fieldErrors, formErrors: this.formErrors },
    };
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function handlePrismaError(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A record with this value already exists.", meta: error.meta },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Related record not found (invalid foreign key)." },
        { status: 400 },
      );
    }
  }

  console.error(error);
  return NextResponse.json(
    { error: "Internal server error." },
    { status: 500 },
  );
}
