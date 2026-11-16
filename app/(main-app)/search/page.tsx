import type { Metadata } from "next";
import SearchResults from "./SearchResults";

type Props = { searchParams: Promise<{ v?: string | string[] }> };

async function readQuery(searchParams: Props["searchParams"]) {
  const { v } = await searchParams;
  return ((Array.isArray(v) ? v[0] : v) ?? "").trim().slice(0, 100);
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const q = await readQuery(searchParams);
  return {
    title: q ? `جستجوی «${q}»` : "جستجو",
    robots: { index: false }, // search result pages shouldn't be indexed
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = await readQuery(searchParams);
  return <SearchResults query={query} />;
}
