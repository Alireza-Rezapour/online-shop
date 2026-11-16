// import { Category } from "@/app/types/category";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
// import Link from "next/link";

// export default function CategoriesList() {
//   const { data: categories, isLoading } = useGetCategoriesQuery(undefined);

//   if (isLoading)
//     return (
//       <section className=" w-[75%] mx-auto grid grid-cols-2 gap-5">
//         {[0, 1, 2, 3].map((i) => (
//           <Skeleton className="rounded overflow-hidden" />
//         ))}
//       </section>
//     );

//   const parrentCategories = categories.filter(
//     (category: Category) => category.parentId === null,
//   );

//   return (
//     <section className=" w-[75%] mx-auto grid grid-cols-2 gap-5">
//       {parrentCategories.map((category: Category) => {
//         return (
//           <Link
//             href={`categories/${category.slug}`}
//             className="rounded overflow-hidden"
//           >
//             <img src={category.image} alt="" className="h-full w-full" />
//           </Link>
//         );
//       })}
//     </section>
//   );
// }
