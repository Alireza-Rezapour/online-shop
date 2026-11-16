"use client";

import {
  useGetBestSellingProductsQuery,
  useGetStoreProductsQuery,
} from "@/redux/services/storeProductApi";
import { ProductsSwiper } from "../../components/productSwiper/ProductSwiper";

interface SectionProps {
  className?: string;
}

export function BestSellingSection({ className }: SectionProps) {
  const { data, isLoading, isError } = useGetBestSellingProductsQuery({
    limit: 10,
  });

  // The home page should never show an error box for an optional section
  if (isError) return null;

  return (
    <ProductsSwiper
      subtitle="محبوب‌ترین انتخاب‌های مشتریان ما"
      viewAllHref="/products"
      products={data ?? []}
      isLoading={isLoading}
      className={className}
    />
  );
}

export function NewestSection({ className }: SectionProps) {
  const { data, isLoading, isError } = useGetStoreProductsQuery({
    sort: "newest",
    page: 1,
    pageSize: 10,
    inStock: true,
  });

  if (isError) return null;

  return (
    <ProductsSwiper
      subtitle="تازه‌ترین محصولات فروشگاه"
      viewAllHref="/products?sort=newest"
      products={data?.items ?? []}
      isLoading={isLoading}
      className={className}
    />
  );
}
