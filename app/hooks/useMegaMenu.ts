import { useMemo } from "react";

import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import {
  MegaMenuCategory,
  MegaMenuItem,
  MegaMenuSection,
} from "../types/megaMenu";
import { Category } from "@/lib/generated/prisma/client";

export function useMegaMenu(): MegaMenuCategory[] {
  const { data: categories, isLoading } = useGetCategoriesQuery();

  return useMemo(() => {
    // اگر در حال بارگذاری یا داده‌ای وجود نداشته باشد، آرایه خالی برگردان
    if (isLoading || !categories) {
      return [];
    }

    // دسته‌های اصلی (ریشه)
    const roots = categories.filter(
      (category: Category) => category.parentId === null,
    );

    return roots.map((root: Category) => {
      // دسته‌های سطح دوم (بخش‌ها)
      const sections: MegaMenuSection[] = categories
        .filter((category: Category) => category.parentId === root.id)
        .map((section: Category) => {
          // دسته‌های سطح سوم (آیتم‌ها)
          const items: MegaMenuItem[] = categories
            .filter((category: Category) => category.parentId === section.id)
            .map((item: Category) => ({
              id: item.id,
              name: item.name,
              slug: item.slug,
            }));

          return {
            id: section.id,
            name: section.name,
            slug: section.slug,
            items,
          };
        });

      return {
        id: root.id,
        name: root.name,
        slug: root.slug,
        sections,
      };
    });
  }, [categories, isLoading]); // وابستگی‌ها
}
