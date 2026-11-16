"use client";

import { useParams } from "next/navigation";
import { useGetCollectionBySlugQuery } from "@/redux/services/collectionApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductListView } from "../../components/product-listing/ProductListView";
import NotFound from "@/app/not-found";
import { useGetStoreProductsQuery } from "@/redux/services/storeProductApi";

export default function ProductsByCollection() {
  const { slug } = useParams() as { slug: string };

  const { data: collection, isLoading: collectionLoading } =
    useGetCollectionBySlugQuery(slug);

  const { data: products, isLoading: productsLoading } =
    useGetStoreProductsQuery(
      { collection: slug, pageSize: 100 }, // see the note below
      { skip: !collection },
    );

  if (collectionLoading || (collection && productsLoading)) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!collection) return <NotFound />;

  return (
    <ProductListView
      products={products?.items ?? []}
      title={collection.name}
      emptyMessage="هنوز محصولی در این کالکشن نیست"
    />
  );
}
