"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteHeroSlideMutation,
  useGetAdminHeroSlidesQuery,
  type AdminHeroSlide,
} from "@/redux/services/heroSlideApi";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { HeroSlideTable } from "./hero-slide-table";
import { PreviewBoundary } from "./preview-boundary";
import { Hero } from "@/app/(main-app)/(home-page)/components/Hero/hero";

export function HeroSlidesManager() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetAdminHeroSlidesQuery();
  const [deleteHeroSlide, { isLoading: isDeleting }] =
    useDeleteHeroSlideMutation();

  const [toDelete, setToDelete] = useState<AdminHeroSlide | null>(null);
  const [preview, setPreview] = useState<AdminHeroSlide | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteHeroSlide(toDelete.id).unwrap();
      SuccessToast("اسلاید حذف شد");
      setToDelete(null);
    } catch {
      ErrorToast("حذف اسلاید انجام نشد. دوباره تلاش کنید.");
    }
  }

  const slides = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">اسلایدهای هیرو</h2>
          <p className="text-sm text-muted-foreground">
            برای تغییر ترتیب نمایش، ردیف‌ها را بکشید و رها کنید.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/hero/new">
            <Plus className="size-4" aria-hidden="true" />
            اسلاید جدید
          </Link>
        </Button>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            دریافت اسلایدها انجام نشد.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            تلاش دوباره
          </Button>
        </div>
      ) : (
        <HeroSlideTable
          slides={slides}
          isLoading={isLoading}
          onEdit={(slide) => router.push(`/admin/hero/${slide.id}`)}
          onDelete={setToDelete}
          onPreview={setPreview}
          onCreate={() => router.push("/admin/hero/new")}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && !isDeleting && setToDelete(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف اسلاید</AlertDialogTitle>
            <AlertDialogDescription>
              اسلاید «{toDelete?.title.replace(/\n/g, " ")}» برای همیشه حذف
              می‌شود. این کار قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isDeleting}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault(); // keep the dialog open until the request ends
                confirmDelete();
              }}
              className="gap-2 bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview: the real storefront component, at the dialog's width */}
      <Dialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent
          dir="rtl"
          className="max-w-[min(1200px,95vw)] gap-0 overflow-hidden p-0 sm:max-w-[min(1200px,95vw)]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>پیش‌نمایش اسلاید</DialogTitle>
            <DialogDescription>
              نمایش اسلاید همان‌طور که در فروشگاه دیده می‌شود.
            </DialogDescription>
          </DialogHeader>
          {/* {preview ? (
            <div
              // Links inside the preview must not navigate away from the admin
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) e.preventDefault();
              }}
            >
              <PreviewBoundary resetKey={preview.id}>
                <Hero slides={[preview]} />
              </PreviewBoundary>
            </div>
          ) : null} */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
