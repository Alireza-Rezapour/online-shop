"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useSelector } from "react-redux";

import { formatPrice } from "@/lib/utils";
import { selectCartItems, selectCartTotals } from "@/redux/slices/cartSlice";

const MAX_ROWS = 5;

export default function CartPreview() {
  const cart = useSelector(selectCartItems);
  const { qty: count, amount: total } = useSelector(selectCartTotals);

  const extra = cart.length - MAX_ROWS;

  return (
    <div className="group/cart relative flex items-center">
      <Link
        href="/cart"
        aria-label={`سبد خرید، ${count} کالا`}
        className="relative grid size-10 place-items-center rounded-full text-primary transition-colors duration-200 hover:bg-muted"
      >
        <ShoppingBag className="size-5" strokeWidth={1.75} />
        {count > 0 && (
          <span
            key={count}
            className="absolute -end-0.5 -top-0.5 grid h-[18px] min-w-[18px] animate-in place-items-center rounded-full bg-primary-foreground px-1 text-[10px] font-medium leading-none text-secondary duration-300 zoom-in-50"
          >
            {count}
          </span>
        )}
      </Link>

      {/* hover / keyboard-focus preview */}
      <div className="invisible absolute left-1/2 top-full z-50 hidden w-[22rem] -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-200 ease-out group-focus-within/cart:visible group-focus-within/cart:opacity-100 group-hover/cart:visible group-hover/cart:opacity-100 lg:block">
        <div
          dir="rtl"
          className="-translate-y-1 rounded-2xl border border-muted bg-background p-4 text-right shadow-2xl transition-transform duration-200 ease-out group-focus-within/cart:translate-y-0 group-hover/cart:translate-y-0"
        >
          <div className="flex items-center justify-between border-b border-muted/70 pb-3">
            <h3 className="text-sm font-medium text-primary">سبد خرید</h3>
            <span className="text-xs text-muted-foreground">{count} کالا</span>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <ShoppingBag className="size-5" strokeWidth={1.5} />
              </span>
              <p className="text-sm text-muted-foreground">
                سبد خرید شما خالی است.
              </p>
              <Link
                href="/"
                className="text-sm text-primary-foreground underline-offset-4 hover:underline"
              >
                شروع خرید
              </Link>
            </div>
          ) : (
            <>
              <ul className="max-h-72 divide-y divide-muted/60 overflow-y-auto">
                {cart.slice(0, MAX_ROWS).map((item) => {
                  const unit =
                    item.salePrice != null && item.salePrice < item.price
                      ? item.salePrice
                      : item.price;

                  return (
                    <li key={item.variantId}>
                      <Link
                        className="flex items-center gap-3 py-3 transition-opacity hover:opacity-80"
                        href={`/product/${item.slug}`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                            className="h-16 w-12 shrink-0 rounded-lg bg-muted object-cover"
                          />
                        ) : (
                          <span className="h-16 w-12 shrink-0 rounded-lg bg-muted" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-primary">
                            {item.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {item.colorName} / {item.sizeName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.cartQty} × {formatPrice(unit, "تومان")}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {extra > 0 && (
                <p className="border-t border-muted/60 pt-2.5 text-center text-xs text-muted-foreground">
                  و {extra} کالای دیگر
                </p>
              )}

              <div className="mt-2 flex items-center justify-between border-t border-muted/70 pt-3 text-sm">
                <span className="text-muted-foreground">جمع کل</span>
                <span className="font-medium text-primary">
                  {formatPrice(total, "تومان")}
                </span>
              </div>

              <Link
                href="/cart"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-primary-foreground text-sm text-secondary transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
              >
                مشاهده سبد خرید
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
