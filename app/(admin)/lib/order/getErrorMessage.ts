import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return "خطایی رخ داد.";
  if ("status" in error) {
    const data = error.data as { error?: string } | undefined;
    if (data?.error) return data.error;
    return `درخواست ناموفق بود (${error.status}).`;
  }
  if ("message" in error && error.message) return error.message;
  return "خطایی رخ داد.";
}
