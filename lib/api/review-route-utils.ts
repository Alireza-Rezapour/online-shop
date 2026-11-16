import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";

/**
 * Small helpers used only by the review routes.
 * If you prefer your own withErrorHandling / requireAdmin, change this one file
 * (keep the names `handle`, `requireUser`, `requireAdminUser`) and the routes need no edits.
 */

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// The services throw plain Errors; this maps their messages to HTTP statuses
const STATUS_BY_MESSAGE: Record<string, number> = {
  "Product not found": 404,
  "Review not found": 404,
  "You have already reviewed this product": 409,
  "You can only review products you have purchased": 403,
};

const fail = (status: number, message: string) =>
  NextResponse.json({ message }, { status });

/** Wraps a route handler: every error becomes a JSON `{ message }` with the right status. */
export function handle<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return fail(err.status, err.message);
      if (err instanceof ZodError) {
        return fail(400, err.issues[0]?.message ?? "Invalid input");
      }
      if (err instanceof SyntaxError) return fail(400, "Invalid JSON body");
      if (err instanceof Error && err.message in STATUS_BY_MESSAGE) {
        return fail(STATUS_BY_MESSAGE[err.message], err.message);
      }
      console.error(err);
      return fail(500, "Internal server error");
    }
  };
}

/** The signed-in user, or a 401. */
export async function requireUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) throw new HttpError(401, "Unauthorized");
  return session.user;
}

/** The signed-in admin, or a 401 / 403. */
export async function requireAdminUser(req: Request) {
  const user = await requireUser(req);
  if (user.role !== "admin") throw new HttpError(403, "Forbidden");
  return user;
}
