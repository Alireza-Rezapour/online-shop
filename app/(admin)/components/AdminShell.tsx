"use client";

import {
  Boxes,
  Brush,
  ChevronLeft,
  Grid2x2,
  Home,
  Images,
  LayoutDashboard,
  LibraryBig,
  MessagesSquare,
  Package,
  Ruler,
  Settings,
  Shirt,
  ShirtIcon,
  ShoppingCart,
  Star,
  Ticket,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// This sidebar renders alongside the wizard so the page reads correctly
// inside the larger dashboard, but it only wires up the Products entry —
// every other item is a placeholder for a page that doesn't exist yet.
const NAV_ITEMS = [
  { label: "داشبور", icon: LayoutDashboard, href: "dashboard", active: false },
  { label: "سفارش ها", icon: ShoppingCart, href: "orders", active: false },
  { label: "کاربران", icon: Users, href: "users", active: false },
  { label: "نظرات", icon: MessagesSquare, href: "reviews", active: false },
  { label: "محصولات", icon: Package, href: "products", active: true },
  { label: "کتگوری ها", icon: Grid2x2, href: "categories", active: false },
  { label: "سایزها", icon: Ruler, href: "size-charts", active: false },
  { label: "رنگ‌ها", icon: Brush, href: "colors", active: false },
  { label: "ویژگی‌ها", icon: ShirtIcon, href: "attributes", active: false },
  { label: "کالکشن ها", icon: LibraryBig, href: "collections", active: false },
  { label: "استایل ها", icon: Shirt, href: "looks", active: false },
  {
    label: "شرکت های ارسال",
    icon: Truck,
    href: "carriers",
    active: false,
  },
  { label: "Hero", icon: Images, href: "hero", active: false },
  { label: "کد تخفیف", icon: Ticket, href: "coupons", active: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-foreground text-secondary">
            <Boxes className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold">پنل ادمین</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.split("/")[2] === item.href;
            return (
              <Link
                key={item.label}
                href={`/admin/${item.href}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary-foreground/10 font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}

type Breadcrumb = {
  label: string;
  href: string;
};

export function PageHeader({ breadcrumb }: { breadcrumb: Breadcrumb[] }) {
  return (
    <header className="border-b border-border bg-background px-4 py-4 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
      >
        <Link className="flex gap-2" href={"/"}>
          <Home size={16} />
          صفحه اصلی
        </Link>
        |
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="h-3 w-3" />}
            <span
              className={i === breadcrumb.length - 1 ? "text-foreground" : ""}
            >
              <Link href={crumb.href}>{crumb.label}</Link>
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
}
