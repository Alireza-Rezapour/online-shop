import { ImagePlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSlideTableSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-10" />
        </div>
      ))}
    </div>
  );
}

export function HeroSlideEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <ImagePlus className="size-8 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">هنوز اسلایدی ساخته نشده است</p>
        <p className="text-sm text-muted-foreground">
          اولین اسلاید را بسازید تا در صفحه‌ی اصلی فروشگاه نمایش داده شود.
        </p>
      </div>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="size-4" aria-hidden="true" />
        اسلاید جدید
      </Button>
    </div>
  );
}
