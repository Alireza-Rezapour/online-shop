import ProductDetails, { ProductDetailsSkeleton } from "./ProductDetails";
import { cache, Suspense } from "react";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getPublicUrl } from "@/services/storage/storage.public-url";

const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      coverImage: true,
    },
  });
});

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) return { title: "محصول یافت نشد" };

  return {
    title: product.title,
    description: product.description?.slice(0, 160),
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160),
      images: [
        { url: getPublicUrl(product.coverImage)!, width: 800, height: 1000 },
      ],
      type: "website", // or "product" via a plugin, App Router OG doesn't have native "product" type
    },
  };
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetails />
    </Suspense>
  );
}
