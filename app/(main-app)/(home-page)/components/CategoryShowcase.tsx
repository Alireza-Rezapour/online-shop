import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";

type ShowcaseCategory = {
  id: string;
  title: string;
  image: string;
  href: string;
  /** Tailwind classes controlling the card's size in the desktop grid */
  layout: string;
};

// TODO: replace each href with your real category route (e.g. /categories/<slug>)
// and each image with your own editorial photo.
const CATEGORIES: ShowcaseCategory[] = [
  {
    id: "men",
    title: "مردانه",
    image: "/images/categories/men.webp",
    href: "/categories/men",
    layout: "lg:col-span-5 lg:row-span-2",
  },
  {
    id: "women",
    title: "زنانه",
    image: "/images/categories/women.webp",
    href: "/categories/women",
    layout: "lg:col-span-4 lg:row-span-2",
  },
  {
    id: "kids",
    title: "بچگانه",
    image: "/images/categories/kids.webp",
    href: "/categories/kids",
    layout: "lg:col-span-3 lg:row-span-1",
  },
  {
    id: "accessories",
    title: "اکسسوری",
    image: "/images/categories/accessories.webp",
    href: "/categories/accessories",
    layout: "lg:col-span-3 lg:row-span-1",
  },
];

export default function CategoryShowcase() {
  return (
    <section
      aria-labelledby="category-showcase-heading"
      className="mx-auto w-full max-w-350 px-4 py-6 sm:px-6 lg:px-6 lg:py-10"
    >
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:auto-rows-[280px] xl:auto-rows-[320px] lg:gap-5">
        {CATEGORIES.map((category, index) => (
          <li key={category.id} className={`min-w-0 ${category.layout}`}>
            <Link
              href={category.href}
              className="group relative block aspect-3/4 h-full w-full overflow-hidden rounded-[var(--radius)] bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:aspect-auto"
            >
              <Image
                src={category.image}
                alt=""
                fill
                priority={index < 2}
                sizes="(min-width: 1024px) 40vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"
              />

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 text-white sm:p-6">
                <h3 className="text-xl font-normal tracking-tight sm:text-2xl lg:text-3xl">
                  {category.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-white/85 sm:text-sm">
                  مشاهده کالکشن
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                  />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
