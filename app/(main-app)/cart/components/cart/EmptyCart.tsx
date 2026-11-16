"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="flex min-h-105 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50">
        <ShoppingBag className="h-7 w-7 text-neutral-400" strokeWidth={1.5} />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-neutral-900">
        سبد خرید شما خالی است
      </h2>
      <p className="mt-2 max-w-xs text-sm text-neutral-500">
        محصولاتی که به سبد خرید خود اضافه میکنید اینجا نمایش داده میشود.
      </p>
      <Link
        href={"/"}
        className="mt-6 rounded-full bg-[#68578b] px-8 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#574773] hover:shadow-[0_4px_20px_rgba(104,87,139,0.35)]"
      >
        شروع خرید
      </Link>
    </div>
  );
}
