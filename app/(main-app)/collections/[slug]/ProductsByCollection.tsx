"use client";

import { useGetCollectionBySlugQuery } from "@/redux/services/collectionApi";
import ProductsList from "../../components/ProductsList/ProductsList";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsByCollection() {
  const { slug } = useParams() as { slug: string };

  const { data: collection, isLoading } = useGetCollectionBySlugQuery(slug);

  if (isLoading) return <Skeleton />;

  const products = collection.products.map((p: any) => p.product);

  return (
    <div>
      <ProductsList items={products} title={collection.name} />
    </div>
  );
}
