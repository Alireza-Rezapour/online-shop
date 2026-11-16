// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { Check, Heart, ShoppingBag } from "lucide-react";
// import { cn, formatPrice } from "@/lib/utils";
// import { Product } from "@/app/types/product";
// import { useDispatch } from "react-redux";
// import { addToCart } from "@/redux/slices/cartSlice";
// import { useEffect, useState } from "react";
// import { useToggleFavoriteMutation } from "@/redux/services/favoriteApi";

// export interface ProductCardData {
//   id: string;
//   slug: string;
//   title: string;
//   coverImage: string;
//   hoverImage?: string | null;
//   basePrice: number;
//   salePrice?: number | null;
// }

// interface ProductCardProps {
//   product: Product;
//   isFavorite?: boolean;

//   className?: string;
// }

// export function ProductCard({
//   product,
//   isFavorite = false,
//   className,
// }: ProductCardProps) {
//   const [addedToFavorites, setAddedToFavorites] = useState(product.isFavorite);
//   const [added, setAdded] = useState(false);

//   const dispatch = useDispatch();

//   const { title, slug, images, basePrice, salePrice } = product;
//   const hasSale = typeof salePrice === "number" && salePrice < basePrice;
//   const hoverImage = images.find((img) => img.type === "HOVER")?.url;
//   const coverImage = images.find((img) => img.type === "COVER")?.url;

//   const [toggleFavorite] = useToggleFavoriteMutation();

//   useEffect(() => {
//     if (!added) return;
//     const t = setTimeout(() => setAdded(false), 1500);
//     return () => clearTimeout(t);
//   }, [added]);

//   const handleAddToCart = () => {
//     dispatch(
//       addToCart({
//         ...product,
//         cartQty: 1,
//         selectedVariant: product.variants[0],
//       }),
//     );

//     setAdded(true);
//   };

//   const handleAddToFavorites = async () => {
//     toggleFavorite({ productId: product.id });
//     setAddedToFavorites((prev) => !prev);
//   };

//   return (
//     <div className={cn("group relative flex w-full flex-col", className)}>
//       <div className="relative block aspect-3/4 w-full overflow-hidden rounded-xl bg-neutral-100">
//         <Link href={`/products/${slug}`}>
//           <div
//             className={[
//               "absolute top-2 -right-5 bg-off rounded-3xl z-30 p-2 pr-6 text-secondary text-[8px] sm:text-[13px] lg:text-[17px]",
//               salePrice ? "block" : "hidden",
//             ].join(" ")}
//           >
//             {salePrice
//               ? (((basePrice - salePrice) / basePrice) * 100).toFixed(0)
//               : null}
//             %
//           </div>
//           <Image
//             src={coverImage || "/empty.jpg"}
//             alt={title}
//             fill
//             sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
//             className={cn(
//               "object-cover transition-opacity duration-300",
//               hoverImage && "group-hover:opacity-0",
//             )}
//           />

//           {hoverImage && (
//             <Image
//               src={hoverImage}
//               alt={title}
//               fill
//               sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
//               className="absolute inset-0 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
//             />
//           )}
//         </Link>
//         {/* Quick add to favorite */}
//         <button
//           type="button"
//           onClick={handleAddToFavorites}
//           aria-label={
//             isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
//           }
//           aria-pressed={isFavorite}
//           className=" absolute left-2 top-2 z-20 flex p-1.5 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-500"
//         >
//           <Heart
//             className={cn(
//               addedToFavorites ? "fill-[#68578b] text-[#68578b]" : "",
//               "w-4 h-4 sm:w-6 sm:h-6",
//             )}
//           />
//         </button>

//         {/* Quick add to cart */}
//         <button
//           type="button"
//           onClick={handleAddToCart}
//           className="absolute inset-x-2 bottom-2 z-20 flex items-center justify-center gap-1.5 rounded-lg bg-primary-foreground py-2 text-xs font-medium text-white backdrop-blur transition-all duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:text-sm"
//         >
//           {added ? (
//             <>
//               <Check size={14} /> اضافه شد
//             </>
//           ) : (
//             <>
//               <ShoppingBag size={14} />
//               افزودن به سبد خرید
//             </>
//           )}
//         </button>
//       </div>

//       <div className="mt-3 flex flex-col gap-1">
//         <Link
//           href={`/products/${slug}`}
//           className="line-clamp-1 text-sm text-neutral-800 transition-colors hover:text-neutral-950 sm:text-base"
//         >
//           {title}
//         </Link>

//         <div className="flex items-center gap-2">
//           {hasSale ? (
//             <>
//               <span className="text-sm font-semibold text-primary-foreground sm:text-base">
//                 {formatPrice(salePrice as number)}
//               </span>
//               <span className="text-xs text-neutral-400 line-through sm:text-sm">
//                 {formatPrice(basePrice)}
//               </span>
//             </>
//           ) : (
//             <span className="text-sm font-semibold text-neutral-900 sm:text-base">
//               {formatPrice(basePrice)}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
