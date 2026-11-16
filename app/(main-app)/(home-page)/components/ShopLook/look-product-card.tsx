import Image from "next/image";
import Link from "next/link";
import { Shirt } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { LookProductDto } from "@/services/look/look.types";

type Props = {
  product: LookProductDto;
  // false while the slide is off-screen, so keyboard focus skips it
  focusable?: boolean;
};

/**
 * One component, two shapes:
 * - mobile: a small vertical tile (photo, name, price) for a horizontal strip
 * - desktop: a compact row (thumbnail on the side) for the panel list
 */
export function LookProductCard({ product, focusable = true }: Props) {
  return (
    <Link
      href={`/products/${product.slug}`}
      tabIndex={focusable ? 0 : -1}
      draggable={false}
      className="group/card flex w-24 shrink-0 flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:w-full lg:flex-row lg:items-center lg:gap-4 lg:rounded-xl lg:p-2 lg:transition-colors lg:hover:bg-muted"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted lg:w-16 lg:shrink-0">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            draggable={false}
            sizes="(min-width: 1024px) 64px, 96px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Shirt className="size-5" aria-hidden />
          </div>
        )}
        {product.hoverImageUrl && (
          <Image
            src={product.hoverImageUrl}
            alt=""
            fill
            draggable={false}
            sizes="(min-width: 1024px) 64px, 96px"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          />
        )}
      </div>

      <div className="mt-1.5 min-w-0 lg:mt-0 lg:flex-1">
        <h4 className="line-clamp-1 text-xs font-medium transition-colors lg:text-sm lg:group-hover/card:text-primary">
          {product.title}
        </h4>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-xs font-semibold lg:text-sm">
            {formatPrice(product.currentPrice, "تومان")}
          </span>
          {product.salePrice != null && (
            <del className="hidden text-xs text-muted-foreground lg:inline">
              {formatPrice(product.basePrice, "تومان")}
            </del>
          )}
        </div>
      </div>

      {product.discountPercent != null && (
        <span className="hidden shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground lg:inline">
          {product.discountPercent.toLocaleString("fa-IR")}٪
        </span>
      )}
    </Link>
  );
}
