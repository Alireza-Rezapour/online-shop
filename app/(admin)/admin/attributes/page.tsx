"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  useDeleteAttributeMutation,
  useGetAttributesQuery,
} from "@/redux/services/attributeApi";
import type { AttributeDto } from "@/services/attribute/attribute.service";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { AttributeFormDialog } from "../../components/attribute/attribute-form-dialog";
import { PageHeader } from "../../components/AdminShell";

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}

export default function AdminAttributePage() {
  const {
    data: attributes = [],
    isLoading,
    isError,
    refetch,
  } = useGetAttributesQuery();
  const [deleteAttribute, { isLoading: isDeleting }] =
    useDeleteAttributeMutation();

  const [form, setForm] = useState<{
    open: boolean;
    attribute: AttributeDto | null;
  }>({ open: false, attribute: null });
  const [deleteTarget, setDeleteTarget] = useState<AttributeDto | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAttribute(deleteTarget.id).unwrap();
      SuccessToast("ویژگی حذف شد");
      setDeleteTarget(null);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "حذف ویژگی ناموفق بود"));
    }
  };

  return (
    <>
      <PageHeader breadcrumb={[{ href: "/admin", label: "داشبورد" }]} />
      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3 p-10">
        <p className="text-sm text-muted-foreground">
          ویژگی‌ها به دسته‌بندی‌ها متصل می‌شوند و در صفحه محصول و فیلترها نمایش
          داده می‌شوند.
        </p>
        <Button
          size="sm"
          onClick={() => setForm({ open: true, attribute: null })}
        >
          <Plus className="size-4" />
          ویژگی جدید
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg bg-muted/60"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-sm">
          <p className="text-muted-foreground">دریافت ویژگی‌ها ناموفق بود.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </div>
      )}

      {!isLoading && !isError && attributes.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-sm">
          <p className="text-muted-foreground">هنوز ویژگی‌ای ایجاد نشده است.</p>
          <Button
            size="sm"
            onClick={() => setForm({ open: true, attribute: null })}
          >
            ایجاد اولین ویژگی
          </Button>
        </div>
      )}

      {!isLoading && !isError && attributes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {attributes.map((attribute) => (
            <div
              key={attribute.id}
              className="flex flex-col gap-4 rounded-lg border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{attribute.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {attribute.values.length} مقدار · {attribute.categoryCount}{" "}
                    دسته‌بندی · {attribute.productCount} محصول
                  </p>
                </div>
                <div className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="ویرایش"
                    onClick={() => setForm({ open: true, attribute })}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={
                      attribute.productCount > 0
                        ? "این ویژگی در محصولات استفاده شده است"
                        : "حذف"
                    }
                    disabled={attribute.productCount > 0}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(attribute)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {attribute.values.map((v) => (
                  <span
                    key={v.id}
                    className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium"
                  >
                    {v.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AttributeFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        attribute={form.attribute}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>حذف ویژگی</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleteTarget?.name}» و تمام مقدارهای آن مطمئن هستید؟
              {deleteTarget && deleteTarget.categoryCount > 0 && (
                <>
                  {" "}
                  اتصال این ویژگی به {deleteTarget.categoryCount} دسته‌بندی نیز
                  حذف خواهد شد.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting}>انصراف</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
