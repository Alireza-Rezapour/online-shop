// app/(main-app)/search/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "./SearchResults";

type Props = { searchParams: Promise<{ v?: string | string[] }> };

// Static metadata: no runtime data, so nothing blocks the prerender
export const metadata: Metadata = {
  title: "جستجو",
  robots: { index: false },
};

async function SearchContent({ searchParams }: Props) {
  const { v } = await searchParams;
  const query = ((Array.isArray(v) ? v[0] : v) ?? "").trim().slice(0, 100);
  return <SearchResults query={query} />;
}

export default function SearchPage({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
