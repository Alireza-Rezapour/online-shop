"use client";

import { useGetFavoritesQuery } from "@/redux/services/favoriteApi";
import { ProductListView } from "../components/product-listing/ProductListView";
import Loading from "@/app/components/shared/loading";
import { EmptyState } from "@/app/(dashboard)/components/shared/state-views";
import { Box } from "lucide-react";

export default function Favorites() {
  const { data: favorites, isLoading: favoritesLoading } =
    useGetFavoritesQuery();

  if (favoritesLoading) return <Loading />;
  if (!favorites)
    return (
      <EmptyState
        description="محصولی در لیست محصولات موردعلاقه قرار ندارد"
        title="لیست موردعلاقه‌ها خالی است"
        icon={Box}
      />
    );

  return (
    <div>
      <ProductListView title="مورد علاقه‌ها" products={favorites} />
    </div>
  );
}
