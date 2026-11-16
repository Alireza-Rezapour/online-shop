"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Home,
  LayoutList,
  Search,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { selectCartTotals } from "@/redux/slices/cartSlice";
import { cn } from "@/lib/utils";
import CategoryDrawer from "./CategoryDrawer";
import SearchDrawer from "./SearchDrawer";

type Item = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  match?: string[];
  badge?: number;
};

export default function MobileMenu() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const { qty: cartCount } = useSelector(selectCartTotals);

  const isActive = (match?: string[]) =>
    !!match?.some((m) =>
      m === "/" ? pathname === "/" : pathname.startsWith(m),
    );

  const left: Item[] = [
    {
      key: "account",
      label: session ? "داشبورد" : "ورود",
      icon: User,
      href: isPending ? "/" : session ? "/dashboard" : "/login",
      match: ["/dashboard", "/login"],
    },
    {
      key: "categories",
      label: "دسته‌بندی‌ها",
      icon: LayoutList,
      onClick: () => setCategoriesOpen(true),
    },
  ];

  const right: Item[] = [
    {
      key: "search",
      label: "جستجو",
      icon: Search,
      onClick: () => setSearchOpen(true),
    },
    {
      key: "cart",
      label: "سبد خرید",
      icon: ShoppingBag,
      href: "/cart",
      match: ["/cart"],
      badge: cartCount,
    },
  ];

  const renderItem = (item: Item) => {
    const active = isActive(item.match);
    const inner = (
      <>
        <span
          className={cn(
            "relative grid h-8 w-14 place-items-center rounded-full transition-colors duration-300",
            active && "bg-primary-foreground/12",
          )}
        >
          <item.icon
            className="size-[22px]"
            strokeWidth={active ? 2.25 : 1.75}
          />
          {!!item.badge && item.badge > 0 && (
            <span
              key={item.badge}
              className="absolute end-2 top-0 grid h-4 min-w-4 animate-in place-items-center rounded-full bg-primary-foreground px-1 text-[10px] leading-none text-secondary duration-300 zoom-in-50"
            >
              {item.badge}
            </span>
          )}
        </span>
        <span className={cn(active && "font-medium")}>{item.label}</span>
      </>
    );

    const cls = cn(
      "flex h-full flex-col items-center justify-center gap-0.5 text-[11px] transition-colors duration-200 active:scale-95",
      active ? "text-primary-foreground" : "text-primary/70",
    );

    return (
      <li key={item.key} className="h-full">
        {item.href ? (
          <Link href={item.href} className={cls}>
            {inner}
          </Link>
        ) : (
          <button
            type="button"
            onClick={item.onClick}
            className={cn(cls, "w-full")}
          >
            {inner}
          </button>
        )}
      </li>
    );
  };

  const homeActive = pathname === "/";

  return (
    <>
      <nav
        aria-label="منوی اصلی"
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      >
        <div className="border-t border-muted/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
          <ul className="mx-auto grid h-16 max-w-xl grid-cols-5 items-center px-2">
            {left.map(renderItem)}

            <li className="flex h-full justify-center">
              <Link
                href="/"
                aria-label="خانه"
                className={cn(
                  "-mt-6 grid size-14 place-items-center rounded-full bg-primary-foreground text-secondary shadow-lg ring-4 ring-background transition-transform duration-200 active:scale-95",
                  homeActive && "shadow-primary-foreground/40",
                )}
              >
                <Home className="size-6" strokeWidth={2} />
              </Link>
            </li>

            {right.map(renderItem)}
          </ul>
        </div>
      </nav>

      <CategoryDrawer
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
      />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
