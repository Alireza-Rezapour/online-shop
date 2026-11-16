// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-6 text-center">
      {/* 4 [hanger] 4 */}
      <div
        className="flex items-center gap-2 select-none text-primary"
        aria-hidden="true"
      >
        <span className="text-8xl font-bold leading-none sm:text-9xl">4</span>

        <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-muted sm:h-28 sm:w-28">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-primary-foreground dark:text-primary sm:h-14 sm:w-14"
          >
            <path d="M12 7a2 2 0 1 0-2-2" />
            <path d="M12 7v2l9.2 6.1a1.5 1.5 0 0 1-.8 2.9H3.6a1.5 1.5 0 0 1-.8-2.9L12 9" />
          </svg>
        </span>

        <span className="text-8xl font-bold leading-none sm:text-9xl">4</span>
      </div>

      {/* Text */}
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          این صفحه رو تموم کردیم
        </h1>
        <p className="text-muted-foreground">
          صفحه‌ای که دنبالش میگردی وجود نداره.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-background"
        >
          صفحه اصلی
        </Link>
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          محصولات
        </Link>
      </div>
    </main>
  );
}
