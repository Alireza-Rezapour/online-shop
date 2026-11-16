import type { ApiErrorBody } from "./api-error";

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
}

const FALLBACK: ParsedApiError = {
  message: "خطای غیرمنتظره‌ای رخ داد. لطفا دوباره تلاش کنید.",
  fieldErrors: {},
  formErrors: [],
};

export function parseApiError(error: unknown): ParsedApiError {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    (error.data as Partial<ApiErrorBody>).success === false
  ) {
    const body = error.data as ApiErrorBody;
    return {
      message: body.message ?? FALLBACK.message,
      fieldErrors: body.errors?.fieldErrors ?? {},
      formErrors: body.errors?.formErrors ?? [],
    };
  }
  return FALLBACK;
}
