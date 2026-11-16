// import { useGetProductsQuery } from "@/redux/services/productApi";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ProductsSwiper } from "./productSwiper/ProductSwiper";

// export default function NewArrivals() {
//   const { data: products, isLoading: productLoading } =
//     useGetProductsQuery(undefined);

//   const loading = productLoading;

//   if (loading) {
//     return <Skeleton />;
//   }

//   const newArrivals = products
//     ?.toSorted((a: any, b: any) => {
//       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//     })
//     .slice(0, 7);

//   return (
//     <section className="w-[80%] mx-auto relative">
//       <ProductsSwiper products={newArrivals} />
//     </section>
//   );
// }
