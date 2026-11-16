// "use client";

// import { useId } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Product } from "@/app/types/product";
// import { ProductCard } from "./ProductCard";

// interface ProductsSwiperProps {
//   products: Product[];
//   favoriteIds?: string[];
//   viewAllHref?: string;
//   className?: string;
// }

// export function ProductsSwiper({
//   products,
//   favoriteIds = [],
//   viewAllHref,
//   className,
// }: ProductsSwiperProps) {
//   // unique per-instance classes so multiple swipers on one page don't clash
//   const uid = useId().replace(/:/g, "");
//   const prevClass = `swiper-prev-${uid}`;
//   const nextClass = `swiper-next-${uid}`;

//   return (
//     <div className={cn("relative w-full overflow-hidden", className)}>
//       <Swiper
//         dir="rtl"
//         modules={[Navigation]}
//         navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
//         spaceBetween={12}
//         slidesPerView={2}
//         grabCursor={true} // ← اضافه شد: نشانگر دست هنگام هاور روی اسلایدر
//         breakpoints={{
//           480: { slidesPerView: 2.2, spaceBetween: 14 },
//           640: { slidesPerView: 3, spaceBetween: 16 },
//           1024: { slidesPerView: 4, spaceBetween: 20 },
//           1280: { slidesPerView: 5, spaceBetween: 24 },
//         }}
//       >
//         {products?.map((product) => (
//           <SwiperSlide key={product.id}>
//             <ProductCard
//               product={product}
//               isFavorite={favoriteIds.includes(product.id)}
//             />
//           </SwiperSlide>
//         ))}

//         {viewAllHref && (
//           <SwiperSlide>
//             <a
//               href={viewAllHref}
//               className="flex aspect-3/4 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
//             >
//               مشاهده همه
//               <span aria-hidden className="text-lg">
//                 ←
//               </span>
//             </a>
//           </SwiperSlide>
//         )}
//       </Swiper>

//       {/* ناوبری - دکمه‌ها همیشه نمایش داده می‌شوند، ولی در موبایل کوچک‌تر و شفاف‌تر */}
//       <button
//         type="button"
//         aria-label="محصولات قبلی"
//         className={cn(
//           prevClass,
//           "absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/80 text-neutral-700 shadow-sm transition hover:bg-neutral-50 sm:h-9 sm:w-9 sm:bg-white",
//           "[&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:opacity-30",
//         )}
//       >
//         <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
//       </button>
//       <button
//         type="button"
//         aria-label="محصولات بعدی"
//         className={cn(
//           nextClass,
//           "absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/80 text-neutral-700 shadow-sm transition hover:bg-neutral-50 sm:h-9 sm:w-9 sm:bg-white",
//           "[&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:opacity-30",
//         )}
//       >
//         <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
//       </button>
//     </div>
//   );
// }
