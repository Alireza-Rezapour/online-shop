"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  useDeleteColorMutation,
  useGetColorsQuery,
} from "@/redux/services/colorApi";
import type { ColorDto } from "@/services/color/color.service";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { PageHeader } from "../../components/AdminShell";
import { ColorFormDialog } from "../../components/color/color-form-dialog";

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}

export default function AdminColorPage() {
  const {
    data: colors = [],
    isLoading,
    isError,
    refetch,
  } = useGetColorsQuery();
  const [deleteColor, { isLoading: isDeleting }] = useDeleteColorMutation();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ open: boolean; color: ColorDto | null }>({
    open: false,
    color: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<ColorDto | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return colors;
    return colors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.hex.toLowerCase().includes(q),
    );
  }, [colors, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteColor(deleteTarget.id).unwrap();
      SuccessToast("رنگ حذف شد");
      setDeleteTarget(null);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "حذف رنگ ناموفق بود"));
    }
  };

  return (
    <>
      <PageHeader breadcrumb={[{ href: "/admin", label: "داشبورد" }]} />

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3 p-10">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام، کد یا Hex"
            className="ps-9"
          />
        </div>
        <Button size="sm" onClick={() => setForm({ open: true, color: null })}>
          <Plus className="size-4" />
          رنگ جدید
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-muted/60"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-sm">
          <p className="text-muted-foreground">دریافت رنگ‌ها ناموفق بود.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </div>
      )}

      {!isLoading && !isError && colors.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-sm">
          <p className="text-muted-foreground">هنوز رنگی ایجاد نشده است.</p>
          <Button
            size="sm"
            onClick={() => setForm({ open: true, color: null })}
          >
            ایجاد اولین رنگ
          </Button>
        </div>
      )}

      {!isLoading && !isError && colors.length > 0 && filtered.length === 0 && (
        <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
          رنگی با این مشخصات پیدا نشد.
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((color) => (
            <div
              key={color.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <span
                className="size-12 shrink-0 rounded-full border shadow-inner"
                style={{ backgroundColor: color.hex }}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{color.name}</p>
                <p
                  dir="ltr"
                  className="text-start text-xs text-muted-foreground"
                >
                  {color.hex} · {color.code}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {color.variantCount} تنوع محصول
                </p>
              </div>

              <div className="flex shrink-0 flex-col">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  title="ویرایش"
                  onClick={() => setForm({ open: true, color })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  title={
                    color.variantCount > 0
                      ? "این رنگ در تنوع محصولات استفاده شده است"
                      : "حذف"
                  }
                  disabled={color.variantCount > 0}
                  onClick={() => setDeleteTarget(color)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ColorFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        color={form.color}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>حذف رنگ</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف رنگ «{deleteTarget?.name}» مطمئن هستید؟ این عملیات قابل
              بازگشت نیست.
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
