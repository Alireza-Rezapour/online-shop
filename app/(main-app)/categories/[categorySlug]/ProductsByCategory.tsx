"use client";

import { useParams } from "next/navigation";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import Link from "next/link";
import { ProductListView } from "../../components/product-listing/ProductListView";
import { useGetStoreProductsQuery } from "@/redux/services/storeProductApi";
import Loading from "@/app/components/shared/loading";
import Image from "next/image";
import { ImageIcon, Shirt } from "lucide-react";

export default function ProductsByCategory() {
  const params = useParams<{ categorySlug: string }>();
  const categorySlug = params.categorySlug as string;
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  const { data: products, isLoading: productsLoading } =
    useGetStoreProductsQuery({ category: categorySlug });

  if (categoriesLoading || productsLoading) return <Loading />;

  const category = categories?.find(
    (category) => category.slug === categorySlug,
  );

  const parentId = categories?.find((cat) => cat.slug === categorySlug)?.id;

  const subCategories = categories?.filter(
    (category) => category.parentId === parentId,
  );

  if (!products) return;

  console.log(subCategories);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 w-[80%] mx-auto mt-10">
        {subCategories?.map((sub) => {
          return (
            <Link
              href={`/categories/${sub.slug}`}
              className=" flex flex-col gap-2"
            >
              <div className="relative w-[90%] h-[10rem] mx-auto border border-primary-foreground rounded-2xl flex justify-center items-center">
                {sub.imageUrl ? (
                  <Image
                    src={sub.imageUrl}
                    fill
                    className="w-full h-full rounded-2xl object-contain"
                    alt=""
                  />
                ) : (
                  <Shirt />
                )}
              </div>
              <div>
                <div>
                  <p className="text-center">{sub.name}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <ProductListView products={products.items} title={category?.name} />
    </>
  );
}
