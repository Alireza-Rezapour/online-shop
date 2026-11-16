"use client";

import Loading from "@/app/components/shared/loading";
import NotFound from "@/app/not-found";
import { useGetStoreProductsQuery } from "@/redux/services/storeProductApi";
import { ProductListView } from "../components/product-listing/ProductListView";

export default function ProductList() {
  const { data, isLoading } = useGetStoreProductsQuery({
    page: 1,
    pageSize: 200,
  });

  if (isLoading) return <Loading />;

  if (!data) return <NotFound />;

  return (
    <>
      <ProductListView products={data?.items} />
    </>
  );
}
