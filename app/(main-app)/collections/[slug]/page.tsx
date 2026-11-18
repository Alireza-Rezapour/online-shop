import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCollectionBySlug } from "@/services/collection/collection.service";
import { getStoreProductsService } from "@/services/product/store-product.service";
import { storeProductListQuerySchema } from "@/services/product/product.schema";
import { ProductListView } from "../../components/product-listing/ProductListView";

type Props = { params: Promise<{ slug: string }> };

async function loadCollection(slug: string) {
  try {
    return await getCollectionBySlug(decodeURIComponent(slug));
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: Props) {
  const collection = await loadCollection((await params).slug);
  return {
    title: collection.name,
    description: collection.description ?? undefined,
  };
}

async function CollectionContent({ params }: Props) {
  const collection = await loadCollection((await params).slug);
  const session = await getSession();

  const { items } = await getStoreProductsService(
    storeProductListQuerySchema.parse({
      collection: collection.slug,
      pageSize: 200,
    }),
    session?.user.id,
  );

  return (
    <>
      {collection.description && (
        <p className="mx-auto max-w-7xl px-5 pt-10 text-sm text-[#1c1a1f]/60 sm:px-8 lg:px-10">
          {collection.description}
        </p>
      )}
      <ProductListView
        key={collection.slug}
        products={items}
        title={collection.name}
      />
    </>
  );
}

export default function CollectionPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">در حال بارگذاری...</div>
      }
    >
      <CollectionContent params={params} />
    </Suspense>
  );
}
