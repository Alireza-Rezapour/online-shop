import Link from "next/link";
import { Flower2 } from "lucide-react";

import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      dir="ltr"
      aria-label="Roze، صفحه اصلی"
      className={cn(
        "group/logo inline-flex items-center gap-1.5 text-primary",
        className,
      )}
    >
      <Flower2
        strokeWidth={1.75}
        className="size-6 text-primary-foreground transition-transform duration-700 ease-out group-hover/logo:rotate-72 motion-reduce:transition-none"
      />
      <span className="text-2xl font-semibold tracking-wide">
        <span className="text-primary-foreground">R</span>oze
      </span>
    </Link>
  );
}
