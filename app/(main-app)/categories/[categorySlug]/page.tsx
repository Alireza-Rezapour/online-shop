import ProductsByCategory from "./ProductsByCategory";
import { cache, Suspense } from "react";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

const getCategoyBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    select: { name: true, image: true },
  });
});

type Props = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;

  const category = await getCategoyBySlug(categorySlug);

  if (!category) return { title: "دسته‌بنده پیدا نشد" };

  return {
    title: category.name,
    alternates: { canonical: `/categories/${categorySlug}` },
    openGraph: {
      title: category.name,
      images: [{ url: category.image ?? "", width: 800, height: 1000 }],
      type: "website", // or "product" via a plugin, App Router OG doesn't have native "product" type
    },
  };
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">در حال بارگذاری...</div>
      }
    >
      <ProductsByCategory />
    </Suspense>
  );
}
