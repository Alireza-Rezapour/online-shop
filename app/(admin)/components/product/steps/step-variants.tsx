"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import {
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from "@/redux/services/categoryApi";
import { useGetColorsQuery } from "@/redux/services/colorApi";
import { useGetSizeChartsQuery } from "@/redux/services/sizeChartApi";
import { useSaveProductVariantsMutation } from "@/redux/services/productApi";
import type { ColorDto } from "@/services/color/color.service";
import type {
  SizeChartDto,
  SizeDto,
} from "@/services/size-chart/size-chart.service";
import type {
  ProductAdminDto,
  ProductVariantDto,
} from "@/services/product/product.service";
import {
  buildSku,
  getErrorMessage,
  SKU_PATTERN,
  skuPrefix,
} from "@/app/(admin)/lib/product/product-utils";
import { StepFooter } from "../step-footer";
import { ColorFormDialog } from "../../color/color-form-dialog";
import { SizeChartFormDialog } from "../../size-chart/size-chart-form-dialog";

type Row = {
  key: string;
  color: ColorDto;
  size: SizeDto;
  existing: ProductVariantDto | undefined;
  defaultSku: string;
};

type Props = {
  product: ProductAdminDto;
  onSaved: (product: ProductAdminDto) => void;
  onBack: () => void;
};

export function StepVariants({ product, onSaved, onBack }: Props) {
  const { data: category, isLoading: loadingCategory } = useGetCategoryQuery(
    product.categoryId,
  );
  const { data: colors = [] } = useGetColorsQuery();
  const { data: charts = [] } = useGetSizeChartsQuery();
  const [updateCategory] = useUpdateCategoryMutation();
  const [saveVariants, { isLoading: isSaving }] =
    useSaveProductVariantsMutation();

  const chart = charts.find((c) => c.id === category?.sizeChartId) ?? null;

  const [selectedColors, setSelectedColors] = useState<string[]>(() => [
    ...new Set(product.variants.map((v) => v.colorId)),
  ]);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(
    () => new Set(product.variants.map((v) => v.sizeId)),
  );
  const [skuEdits, setSkuEdits] = useState<Record<string, string>>({});
  const [colorDialog, setColorDialog] = useState(false);
  const [chartDialog, setChartDialog] = useState(false);

  const prefix = skuPrefix(product.slug, product.id);
  const colorById = useMemo(
    () => new Map(colors.map((c) => [c.id, c])),
    [colors],
  );

  const existingByKey = useMemo(
    () => new Map(product.variants.map((v) => [`${v.colorId}:${v.sizeId}`, v])),
    [product.variants],
  );

  // Colors and sizes that already have orders cannot be deselected
  const lockedColors = useMemo(
    () =>
      new Set(
        product.variants
          .filter((v) => v.orderItemCount > 0)
          .map((v) => v.colorId),
      ),
    [product.variants],
  );
  const lockedSizes = useMemo(
    () =>
      new Set(
        product.variants
          .filter((v) => v.orderItemCount > 0)
          .map((v) => v.sizeId),
      ),
    [product.variants],
  );

  const rows = useMemo<Row[]>(() => {
    if (!chart) return [];
    const list: Row[] = [];
    for (const colorId of selectedColors) {
      const color = colorById.get(colorId);
      if (!color) continue;
      chart.sizes.forEach((size, index) => {
        if (!selectedSizes.has(size.id)) return;
        const key = `${colorId}:${size.id}`;
        const existing = existingByKey.get(key);
        list.push({
          key,
          color,
          size,
          existing,
          defaultSku:
            existing?.sku ?? buildSku(prefix, color.code, size.name, index + 1),
        });
      });
    }
    return list;
  }, [chart, selectedColors, selectedSizes, colorById, existingByKey, prefix]);

  const skuOf = (row: Row) =>
    (skuEdits[row.key] ?? row.defaultSku).trim().toUpperCase();

  const skuCounts = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      const sku = (skuEdits[r.key] ?? r.defaultSku).trim().toUpperCase();
      map.set(sku, (map.get(sku) ?? 0) + 1);
    });
    return map;
  }, [rows, skuEdits]);

  const rowError = (row: Row) => {
    const sku = skuOf(row);
    if (!SKU_PATTERN.test(sku)) return "SKU نامعتبر است";
    if ((skuCounts.get(sku) ?? 0) > 1) return "SKU تکراری است";
    return null;
  };

  const toggleColor = (id: string) => {
    if (selectedColors.includes(id)) {
      if (lockedColors.has(id)) {
        ErrorToast("این رنگ در سفارش‌ها استفاده شده و قابل حذف نیست");
        return;
      }
      setSelectedColors((prev) => prev.filter((c) => c !== id));
    } else {
      setSelectedColors((prev) => [...prev, id]);
    }
  };

  const toggleSize = (id: string) => {
    setSelectedSizes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (lockedSizes.has(id)) {
          ErrorToast("این سایز در سفارش‌ها استفاده شده و قابل حذف نیست");
          return prev;
        }
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleChartSaved = async (saved: SizeChartDto) => {
    // The category had no chart: link the one that was just created
    if (!category?.sizeChartId) {
      try {
        await updateCategory({
          id: product.categoryId,
          data: { sizeChartId: saved.id },
        }).unwrap();
        setSelectedSizes(new Set(saved.sizes.map((s) => s.id)));
      } catch (error) {
        ErrorToast(
          getErrorMessage(error, "اتصال جدول سایز به دسته‌بندی ناموفق بود"),
        );
      }
      return;
    }

    // Select the sizes that were just added to the chart
    const before = new Set(chart?.sizes.map((s) => s.id));
    const added = saved.sizes.filter((s) => !before.has(s.id)).map((s) => s.id);
    setSelectedSizes((prev) => new Set([...prev, ...added]));
  };

  const linkExistingChart = async (sizeChartId: string) => {
    try {
      await updateCategory({
        id: product.categoryId,
        data: { sizeChartId },
      }).unwrap();
      const picked = charts.find((c) => c.id === sizeChartId);
      setSelectedSizes(new Set(picked?.sizes.map((s) => s.id)));
    } catch (error) {
      ErrorToast(
        getErrorMessage(error, "اتصال جدول سایز به دسته‌بندی ناموفق بود"),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) {
      ErrorToast("حداقل یک رنگ و یک سایز انتخاب کنید");
      return;
    }

    try {
      const saved = await saveVariants({
        id: product.id,
        data: {
          variants: rows.map((r) => ({
            id: r.existing?.id,
            colorId: r.color.id,
            sizeId: r.size.id,
            sku: skuOf(r),
            price: r.existing?.price ?? null,
            salePrice: r.existing?.salePrice ?? null,
            stock: r.existing?.stock ?? 0,
          })),
        },
      }).unwrap();
      SuccessToast("تنوع‌ها ذخیره شد");
      onSaved(saved);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره تنوع‌ها ناموفق بود"));
    }
  };

  if (loadingCategory) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted/60" />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        {/* Colors */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">رنگ‌ها</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setColorDialog(true)}
            >
              <Plus className="size-4" />
              رنگ جدید
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const active = selectedColors.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => toggleColor(color.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                    active ? "border-primary bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <span
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </button>
              );
            })}
            {colors.length === 0 && (
              <p className="text-sm text-muted-foreground">
                هنوز رنگی تعریف نشده است.
              </p>
            )}
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              سایزها{" "}
              {chart && (
                <span className="text-muted-foreground">({chart.name})</span>
              )}
            </h3>
            {chart && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedSizes(new Set(chart.sizes.map((s) => s.id)))
                  }
                >
                  انتخاب همه
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartDialog(true)}
                >
                  <Plus className="size-4" />
                  سایز جدید
                </Button>
              </div>
            )}
          </div>

          {chart ? (
            <div dir="ltr" className="flex flex-wrap gap-2">
              {chart.sizes.map((size) => {
                const active = selectedSizes.has(size.id);
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => toggleSize(size.id)}
                    className={cn(
                      "min-w-12 rounded-md border px-3 py-1.5 text-sm font-medium transition",
                      active
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted",
                    )}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-dashed p-5 text-sm">
              <p className="text-muted-foreground">
                دسته‌بندی «{category?.name}» جدول سایز ندارد. یکی را انتخاب کنید
                یا جدول جدید بسازید.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {charts.length > 0 && (
                  <Select onValueChange={linkExistingChart}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="انتخاب جدول سایز موجود" />
                    </SelectTrigger>
                    <SelectContent>
                      {charts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setChartDialog(true)}
                >
                  <Plus className="size-4" />
                  جدول سایز جدید
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Generated variants */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium">
            تنوع‌ها{" "}
            <span className="text-muted-foreground">({rows.length})</span>
          </h3>

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              با انتخاب رنگ و سایز، تنوع‌ها اینجا ساخته می‌شوند.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-start text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3 text-start font-medium">رنگ</th>
                    <th className="p-3 text-start font-medium">سایز</th>
                    <th className="p-3 text-start font-medium">SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const error = rowError(row);
                    return (
                      <tr key={row.key} className="border-t">
                        <td className="p-3">
                          <span className="flex items-center gap-2">
                            <span
                              className="size-4 rounded-full border"
                              style={{ backgroundColor: row.color.hex }}
                            />
                            {row.color.name}
                          </span>
                        </td>
                        <td dir="ltr" className="p-3 text-start">
                          {row.size.name}
                        </td>
                        <td className="p-3">
                          <Input
                            dir="ltr"
                            className="h-8 max-w-64 uppercase"
                            value={skuEdits[row.key] ?? row.defaultSku}
                            onChange={(e) =>
                              setSkuEdits((prev) => ({
                                ...prev,
                                [row.key]: e.target.value,
                              }))
                            }
                          />
                          {error && (
                            <p className="mt-1 text-xs text-destructive">
                              {error}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <StepFooter
        onBack={onBack}
        isSaving={isSaving}
        disabled={rows.some((r) => rowError(r))}
      />

      <ColorFormDialog
        open={colorDialog}
        onOpenChange={setColorDialog}
        color={null}
        onSaved={(color) => setSelectedColors((prev) => [...prev, color.id])}
      />

      <SizeChartFormDialog
        open={chartDialog}
        onOpenChange={setChartDialog}
        chart={chart}
        onSaved={handleChartSaved}
      />
    </form>
  );
}
