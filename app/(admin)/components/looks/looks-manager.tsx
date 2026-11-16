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
  useDeleteLookMutation,
  useGetAdminLooksQuery,
  type AdminLook,
} from "@/redux/services/lookApi";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { PreviewBoundary } from "@/app/(admin)/components/hero/preview-boundary";
import type { LookDto } from "@/services/look/look.types";
import { LookTable } from "./look-table";
import { ShopTheLook } from "@/app/(main-app)/(home-page)/components/ShopLook/shop-the-look";

/** Builds what the storefront would receive: unpublished products are hidden there. */
function toPreviewLook(look: AdminLook): LookDto {
  const items = look.items
    .filter((i) => i.isPublished)
    .map((i) => ({
      id: i.productId,
      title: i.title,
      slug: i.slug,
      imageUrl: i.coverImageUrl,
      hoverImageUrl: null,
      basePrice: i.basePrice,
      salePrice: i.salePrice,
      currentPrice: i.currentPrice,
      discountPercent:
        i.salePrice != null
          ? Math.round((1 - i.salePrice / i.basePrice) * 100)
          : null,
    }));
  const totalPrice = items.reduce((s, i) => s + i.currentPrice, 0);
  const original = items.reduce((s, i) => s + i.basePrice, 0);
  return {
    id: look.id,
    title: look.title,
    slug: look.slug,
    description: look.description,
    imageUrl: look.imageUrl,
    items,
    totalPrice,
    totalOriginalPrice: original > totalPrice ? original : null,
  };
}

export function LooksManager() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetAdminLooksQuery();
  const [deleteLook, { isLoading: isDeleting }] = useDeleteLookMutation();

  const [toDelete, setToDelete] = useState<AdminLook | null>(null);
  const [preview, setPreview] = useState<AdminLook | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteLook(toDelete.id).unwrap();
      SuccessToast("ست حذف شد");
      setToDelete(null);
    } catch {
      ErrorToast("حذف ست انجام نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">ست‌های لباس</h2>
          <p className="text-sm text-muted-foreground">
            برای تغییر ترتیب نمایش در صفحه‌ی اصلی، ردیف‌ها را بکشید و رها کنید.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/looks/new">
            <Plus className="size-4" aria-hidden />
            ست جدید
          </Link>
        </Button>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            دریافت ست‌ها انجام نشد.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            تلاش دوباره
          </Button>
        </div>
      ) : (
        <LookTable
          looks={data ?? []}
          isLoading={isLoading}
          onEdit={(look) => router.push(`/admin/looks/${look.id}`)}
          onDelete={setToDelete}
          onPreview={setPreview}
          onCreate={() => router.push("/admin/looks/new")}
        />
      )}

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && !isDeleting && setToDelete(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف ست</AlertDialogTitle>
            <AlertDialogDescription>
              ست «{toDelete?.title}» برای همیشه حذف می‌شود. خودِ محصولات حذف
              نمی‌شوند. این کار قابل بازگشت نیست.
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

      {/* Preview: the real storefront component */}
      <Dialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent
          dir="rtl"
          className="max-h-[92vh] max-w-[min(1200px,95vw)] gap-0 overflow-y-auto p-0 sm:max-w-[min(1200px,95vw)]"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>پیش‌نمایش ست</DialogTitle>
            <DialogDescription>
              نمایش ست همان‌طور که در صفحه‌ی اصلی فروشگاه دیده می‌شود.
            </DialogDescription>
          </DialogHeader>
          {preview ? (
            <div
              // Links inside the preview must not navigate away from the admin
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) e.preventDefault();
              }}
            >
              <PreviewBoundary resetKey={preview.id}>
                <ShopTheLook looks={[toPreviewLook(preview)]} />
              </PreviewBoundary>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
