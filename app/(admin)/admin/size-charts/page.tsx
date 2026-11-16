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
  useDeleteSizeChartMutation,
  useGetSizeChartsQuery,
} from "@/redux/services/sizeChartApi";
import type { SizeChartDto } from "@/services/size-chart/size-chart.service";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { PageHeader } from "../../components/AdminShell";
import { SizeChartFormDialog } from "../../components/size-chart/size-chart-form-dialog";

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}

export default function AdminSizeChartPage() {
  const {
    data: charts = [],
    isLoading,
    isError,
    refetch,
  } = useGetSizeChartsQuery();
  const [deleteChart, { isLoading: isDeleting }] = useDeleteSizeChartMutation();

  const [form, setForm] = useState<{
    open: boolean;
    chart: SizeChartDto | null;
  }>({
    open: false,
    chart: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<SizeChartDto | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteChart(deleteTarget.id).unwrap();
      SuccessToast("جدول سایز حذف شد");
      setDeleteTarget(null);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "حذف جدول سایز ناموفق بود"));
    }
  };

  return (
    <>
      <PageHeader breadcrumb={[{ href: "/admin", label: "داشبورد" }]} />
      <div className="p-10">
        <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            هر دسته‌بندی می‌تواند به یک جدول سایز متصل شود و تنوع محصولات از
            همین سایزها ساخته می‌شود.
          </p>
          <Button
            size="sm"
            onClick={() => setForm({ open: true, chart: null })}
          >
            <Plus className="size-4" />
            جدول سایز جدید
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
            <p className="text-muted-foreground">
              دریافت جدول‌های سایز ناموفق بود.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              تلاش مجدد
            </Button>
          </div>
        )}

        {!isLoading && !isError && charts.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-10 text-sm">
            <p className="text-muted-foreground">
              هنوز جدول سایزی ایجاد نشده است.
            </p>
            <Button
              size="sm"
              onClick={() => setForm({ open: true, chart: null })}
            >
              ایجاد اولین جدول سایز
            </Button>
          </div>
        )}

        {!isLoading && !isError && charts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {charts.map((chart) => {
              const inUse = chart.sizes.some((s) => s.variantCount > 0);

              return (
                <div
                  key={chart.id}
                  className="flex flex-col gap-4 rounded-lg border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{chart.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {chart.sizes.length} سایز · {chart.categoryCount}{" "}
                        دسته‌بندی
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="ویرایش"
                        onClick={() => setForm({ open: true, chart })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          inUse
                            ? "سایزهای این جدول در محصولات استفاده شده‌اند"
                            : "حذف"
                        }
                        disabled={inUse}
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(chart)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div dir="ltr" className="flex flex-wrap gap-1.5">
                    {chart.sizes.map((size) => (
                      <span
                        key={size.id}
                        className="rounded-md border bg-muted px-2 py-0.5 text-xs font-medium"
                      >
                        {size.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SizeChartFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        chart={form.chart}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>حذف جدول سایز</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف «{deleteTarget?.name}» و تمام سایزهای آن مطمئن هستید؟
              {deleteTarget && deleteTarget.categoryCount > 0 && (
                <>
                  {" "}
                  {deleteTarget.categoryCount} دسته‌بندی که از این جدول استفاده
                  می‌کنند بدون جدول سایز خواهند شد.
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
