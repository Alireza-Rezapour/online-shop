import { useGetStoreProductsQuery } from "@/redux/services/storeProductApi";
import { Metadata } from "next";
import ProductList from "./ProductsList";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "محصولات",
    description: "محصولات پوشاک و اکسسوری",
    alternates: { canonical: `/products` },
  };
}
export default function CoursesPage() {
  return (
    <>
      <ProductList />
    </>
  );
}
