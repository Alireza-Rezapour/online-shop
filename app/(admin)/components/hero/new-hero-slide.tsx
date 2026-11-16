"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminHeroSlidesQuery } from "@/redux/services/heroSlideApi";
import { HeroSlideForm } from "./hero-slide-form";

export function FormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function NewHeroSlide() {
  const { data, isLoading } = useGetAdminHeroSlidesQuery();
  if (isLoading) return <FormSkeleton />;

  // New slides go to the end of the list
  const nextSortOrder = data?.length
    ? Math.max(...data.map((s) => s.sortOrder)) + 1
    : 0;

  return <HeroSlideForm mode="create" nextSortOrder={nextSortOrder} />;
}
