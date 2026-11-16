import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import "./auth.css";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Two-column shell shared by login and sign up.
 * The wrapper is forced to `ltr` so the form is always on the physical LEFT
 * and the image on the physical RIGHT; each column sets its own `rtl`.
 */
export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div dir="ltr" className="grid min-h-svh lg:grid-cols-2">
      {/* Form column */}
      <div
        dir="rtl"
        className="flex flex-col justify-center bg-muted/40 px-5 py-10 sm:px-10 lg:px-14"
      >
        <div className="mx-auto w-full max-w-md">
          {/* Back button: mobile only (on desktop it sits over the image) */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowRight className="size-4" />
            بازگشت به خانه
          </Link>

          {/* The box: card, border and shadow from sm and up */}
          <div className="auth-card auth-card-in rounded-3xl border border-border/60 bg-card p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.22),0_4px_14px_-6px_rgba(0,0,0,0.08)] sm:p-9">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {children}

            <p className="mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
              {footer}
            </p>
          </div>
        </div>
      </div>

      {/* Image column: desktop only */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/auth-side.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="auth-image-settle object-cover"
        />
        <div className="absolute inset-0 bg-black/15" />

        <Link
          href="/"
          dir="rtl"
          className="absolute inset-e-6 top-6 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ArrowRight className="size-4" />
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}
