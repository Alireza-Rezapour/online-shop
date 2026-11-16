"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetHeroSlideQuery } from "@/redux/services/heroSlideApi";
import { HeroSlideForm } from "./hero-slide-form";
import { FormSkeleton } from "./new-hero-slide";

export function EditHeroSlide({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetHeroSlideQuery(id);

  if (isLoading) return <FormSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          این اسلاید پیدا نشد. ممکن است حذف شده باشد.
        </p>
        <Button asChild variant="outline">
          <Link href="/admin/hero">بازگشت به لیست اسلایدها</Link>
        </Button>
      </div>
    );
  }

  return <HeroSlideForm key={data.id} mode="edit" slide={data} />;
}
