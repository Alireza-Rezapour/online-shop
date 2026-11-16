// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { useMemo, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";
// import type { Swiper as SwiperType } from "swiper";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import "swiper/css";
// import "swiper/css/navigation";
// import { useGetCollectionsQuery } from "@/redux/services/collectionApi";
// import { Skeleton } from "@/components/ui/skeleton";
// import { cn } from "@/lib/utils";

// interface Collection {
//   id: string;
//   name: string;
//   slug: string;
//   description: string | null;
//   image: string | null;
//   isActive: boolean;
//   startsAt: string | null;
//   endsAt: string | null;
// }

// const DAY_MS = 1000 * 60 * 60 * 24;

// function isLive(collection: Collection): boolean {
//   if (!collection.isActive) return false;
//   const now = Date.now();
//   if (collection.startsAt && new Date(collection.startsAt).getTime() > now)
//     return false;
//   if (collection.endsAt && new Date(collection.endsAt).getTime() < now)
//     return false;
//   return true;
// }

// function getBadge(
//   collection: Collection,
// ): { label: string; tone: "new" | "ending" } | null {
//   const now = Date.now();

//   if (collection.endsAt) {
//     const daysLeft = (new Date(collection.endsAt).getTime() - now) / DAY_MS;
//     if (daysLeft >= 0 && daysLeft <= 7) {
//       return { label: "به‌زودی تمام می‌شود", tone: "ending" };
//     }
//   }

//   if (collection.startsAt) {
//     const daysSinceStart =
//       (now - new Date(collection.startsAt).getTime()) / DAY_MS;
//     if (daysSinceStart >= 0 && daysSinceStart <= 7) {
//       return { label: "تازه", tone: "new" };
//     }
//   }

//   return null;
// }

// export function CollectionsSwiper({ className }: { className?: string }) {
//   const { data, isLoading, isError } = useGetCollectionsQuery(undefined);
//   const [swiper, setSwiper] = useState<SwiperType | null>(null);
//   const [activeIndex, setActiveIndex] = useState(0);

//   const collections = useMemo(() => {
//     if (!data) return [];
//     return (data as Collection[]).filter(isLive);
//   }, [data]);

//   if (isError) return null;
//   if (!isLoading && collections.length === 0) return null;

//   return (
//     <section className={cn("w-full py-10 sm:py-14", className)} dir="rtl">
//       <div className="mb-6 flex items-end justify-between px-4 sm:px-6 lg:px-8">
//         {!isLoading && collections.length > 1 && (
//           <div className="hidden items-center gap-2 sm:flex">
//             <button
//               type="button"
//               aria-label="اسلاید قبلی"
//               onClick={() => swiper?.slidePrev()}
//               disabled={activeIndex === 0}
//               className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </button>
//             <button
//               type="button"
//               aria-label="اسلاید بعدی"
//               onClick={() => swiper?.slideNext()}
//               disabled={swiper ? swiper.isEnd : false}
//               className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </button>
//           </div>
//         )}
//       </div>

//       {isLoading ? (
//         <div className="flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-8">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div key={i} className="w-[72%] shrink-0 sm:w-[42%] lg:w-[30%]">
//               <Skeleton className="aspect-3/4 w-full rounded-2xl" />
//               <Skeleton className="mt-3 h-4 w-2/3 rounded" />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <>
//           <Swiper
//             dir="rtl"
//             modules={[Navigation]}
//             onSwiper={setSwiper}
//             onSlideChange={(s) => setActiveIndex(s.activeIndex)}
//             spaceBetween={16}
//             slidesPerView={1.15}
//             breakpoints={{
//               640: { slidesPerView: 2.2, spaceBetween: 20 },
//               1024: { slidesPerView: 3.2, spaceBetween: 24 },
//               1280: { slidesPerView: 3.6, spaceBetween: 28 },
//             }}
//             className="px-4! sm:px-6! lg:px-8!"
//           >
//             {collections.map((collection) => {
//               const badge = getBadge(collection);
//               return (
//                 <SwiperSlide key={collection.id}>
//                   <Link
//                     href={`/collections/${collection.slug}`}
//                     className="group relative block aspect-3/4 w-full overflow-hidden rounded-2xl bg-muted"
//                   >
//                     {collection.image ? (
//                       <Image
//                         src={collection.image}
//                         alt={collection.name}
//                         fill
//                         sizes="(max-width: 640px) 75vw, (max-width: 1024px) 42vw, 30vw"
//                         className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
//                       />
//                     ) : (
//                       <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
//                         بدون تصویر
//                       </div>
//                     )}

//                     <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

//                     {badge && (
//                       <span
//                         className={cn(
//                           "absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm",
//                           badge.tone === "ending"
//                             ? "bg-red-500/90 text-white"
//                             : "bg-white/90 text-black",
//                         )}
//                       >
//                         {badge.label}
//                       </span>
//                     )}

//                     <div className="absolute inset-x-0 bottom-0 p-5">
//                       <h3 className="text-lg font-semibold text-white sm:text-xl">
//                         {collection.name}
//                       </h3>
//                       {collection.description && (
//                         <p className="mt-1 line-clamp-2 text-sm text-white/80">
//                           {collection.description}
//                         </p>
//                       )}
//                       <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
//                         مشاهده کالکشن
//                         <ChevronLeft className="h-3.5 w-3.5" />
//                       </span>
//                     </div>
//                   </Link>
//                 </SwiperSlide>
//               );
//             })}
//           </Swiper>

//           <div className="mt-5 px-4 sm:px-6 lg:px-8">
//             <div className="h-0.5 w-full overflow-hidden rounded-full bg-border">
//               <div
//                 className="h-full rounded-full bg-foreground transition-all duration-300 ease-out"
//                 style={{
//                   width: `${((activeIndex + 1) / collections.length) * 100}%`,
//                 }}
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </section>
//   );
// }
