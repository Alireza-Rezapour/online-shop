"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";

import Loading from "@/app/components/shared/loading";
import { useGetStoreProductsQuery } from "@/redux/services/storeProductApi";
import { ProductListView } from "../components/product-listing/ProductListView";

export default function SearchResults({ query }: { query: string }) {
  const tooShort = query.length < 2;

  const { data, isLoading, isError, refetch } = useGetStoreProductsQuery(
    { search: query, sort: "relevance" },
    { skip: tooShort },
  );

  if (tooShort) {
    return (
      <Message
        title="چه چیزی می‌خواهید پیدا کنید؟"
        text="حداقل دو حرف از نام محصول را در نوار جستجو بنویسید."
      />
    );
  }

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <Message title="جستجو انجام نشد" text="لطفاً دوباره تلاش کنید.">
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-primary-foreground underline underline-offset-4"
        >
          تلاش دوباره
        </button>
      </Message>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Message
        title={`برای «${query}» محصولی پیدا نشد`}
        text="املای کلمه را بررسی کنید، یا عبارت کوتاه‌تر و کلی‌تری امتحان کنید."
      >
        <Link
          href="/"
          className="text-sm text-primary-foreground underline underline-offset-4"
        >
          بازگشت به صفحه اصلی
        </Link>
      </Message>
    );
  }

  return (
    <>
      <p className="mx-auto mt-8 w-[80%] text-sm text-muted-foreground">
        {data.total} محصول برای «{query}»
      </p>
      <ProductListView
        products={data.items}
        title={`نتایج جستجو برای «${query}»`}
      />
    </>
  );
}

function Message({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-20 flex w-[80%] max-w-md flex-col items-center gap-3 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-6" strokeWidth={1.5} />
      </span>
      <h1 className="text-lg font-medium text-primary">{title}</h1>
      <p className="text-sm text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}
