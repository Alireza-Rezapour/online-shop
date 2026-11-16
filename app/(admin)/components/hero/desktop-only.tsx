"use client";

import Link from "next/link";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsDesktop } from "../../lib/hero/use-is-desktop";

/** The slide form needs room for the live preview, so it is desktop only. */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <>{children}</>;

  return (
    <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed p-8 text-center">
      <Monitor className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">ساخت و ویرایش اسلاید در موبایل ممکن نیست</p>
        <p className="text-sm text-muted-foreground">
          برای ساخت یا ویرایش اسلاید از رایانه استفاده کنید. در موبایل فقط
          می‌توانید لیست اسلایدها را ببینید و وضعیت آن‌ها را تغییر دهید.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/admin/hero">بازگشت به لیست اسلایدها</Link>
      </Button>
    </div>
  );
}
