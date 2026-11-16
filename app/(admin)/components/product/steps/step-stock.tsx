"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { useGetColorsQuery } from "@/redux/services/colorApi";
import { useGetSizeChartsQuery } from "@/redux/services/sizeChartApi";
import { useSaveProductVariantsMutation } from "@/redux/services/productApi";
import type { ProductAdminDto } from "@/services/product/product.service";
import {
  getErrorMessage,
  toEnglishDigits,
} from "@/app/(admin)/lib/product/product-utils";
import { formatPrice } from "@/lib/utils";
import { PriceInput } from "../../price-input";
import { StepFooter } from "../step-footer";

type Edit = { stock: number; price: number | null; salePrice: number | null };

type Props = {
  product: ProductAdminDto;
  onSaved: (product: ProductAdminDto) => void;
  onBack: () => void;
  goToVariants: () => void;
};

export function StepStock({ product, onSaved, onBack, goToVariants }: Props) {
  const { data: colors = [] } = useGetColorsQuery();
  const { data: charts = [] } = useGetSizeChartsQuery();
  const [saveVariants, { isLoading: isSaving }] =
    useSaveProductVariantsMutation();

  const [edits, setEdits] = useState<Record<string, Edit>>(() =>
    Object.fromEntries(
      product.variants.map((v) => [
        v.id,
        { stock: v.stock, price: v.price, salePrice: v.salePrice },
      ]),
    ),
  );
  const [bulkStock, setBulkStock] = useState("");

  const colorById = useMemo(
    () => new Map(colors.map((c) => [c.id, c])),
    [colors],
  );
  const sizeById = useMemo(
    () => new Map(charts.flatMap((c) => c.sizes).map((s) => [s.id, s])),
    [charts],
  );

  const patch = (id: string, change: Partial<Edit>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));

  const errorOf = (id: string, reserved: number): string | null => {
    const edit = edits[id];
    if (!Number.isInteger(edit.stock) || edit.stock < 0)
      return "موجودی نامعتبر است";
    if (edit.stock < reserved)
      return `موجودی نمی‌تواند کمتر از ${reserved} (رزرو شده) باشد`;
    const effective = edit.price ?? product.basePrice;
    if (edit.salePrice != null && edit.salePrice >= effective) {
      return "قیمت حراج باید کمتر از قیمت تنوع باشد";
    }
    return null;
  };

  const hasErrors = product.variants.some((v) =>
    errorOf(v.id, v.reservedStock),
  );

  const applyBulkStock = () => {
    const value = Number(toEnglishDigits(bulkStock));
    if (!Number.isInteger(value) || value < 0) {
      ErrorToast("یک عدد معتبر برای موجودی وارد کنید");
      return;
    }
    setEdits((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, edit]) => [
          id,
          { ...edit, stock: value },
        ]),
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await saveVariants({
        id: product.id,
        data: {
          variants: product.variants.map((v) => ({
            id: v.id,
            colorId: v.colorId,
            sizeId: v.sizeId,
            sku: v.sku,
            price: edits[v.id].price,
            salePrice: edits[v.id].salePrice,
            stock: edits[v.id].stock,
          })),
        },
      }).unwrap();
      SuccessToast("موجودی و قیمت تنوع‌ها ذخیره شد");
      onSaved(saved);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره موجودی و قیمت ناموفق بود"));
    }
  };

  if (product.variants.length === 0) {
    return (
      <div className="space-y-4 rounded-lg border border-dashed p-8 text-center text-sm">
        <p className="text-muted-foreground">
          هنوز تنوعی ساخته نشده است. ابتدا رنگ‌ها و سایزها را در مرحله قبل
          انتخاب کنید.
        </p>
        <Button type="button" onClick={goToVariants}>
          رفتن به مرحله تنوع‌ها
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          قیمت خالی یعنی از قیمت محصول ({formatPrice(product.basePrice)} تومان)
          استفاده می‌شود.
        </p>
        <div className="flex items-center gap-2">
          <Input
            dir="ltr"
            inputMode="numeric"
            placeholder="موجودی برای همه"
            className="w-40"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={applyBulkStock}>
            اعمال
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-175 text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">رنگ</th>
              <th className="p-3 text-start font-medium">سایز</th>
              <th className="p-3 text-start font-medium">SKU</th>
              <th className="p-3 text-start font-medium">موجودی</th>
              <th className="p-3 text-start font-medium">قیمت</th>
              <th className="p-3 text-start font-medium">قیمت حراج</th>
            </tr>
          </thead>
          <tbody>
            {product.variants.map((variant) => {
              const color = colorById.get(variant.colorId);
              const size = sizeById.get(variant.sizeId);
              const edit = edits[variant.id];
              const error = errorOf(variant.id, variant.reservedStock);

              return (
                <tr key={variant.id} className="border-t align-top">
                  <td className="p-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-4 rounded-full border"
                        style={{ backgroundColor: color?.hex }}
                      />
                      {color?.name}
                    </span>
                  </td>
                  <td dir="ltr" className="p-3 text-start">
                    {size?.name}
                  </td>
                  <td
                    dir="ltr"
                    className="p-3 text-start text-xs text-muted-foreground"
                  >
                    {variant.sku}
                  </td>
                  <td className="p-3">
                    <Input
                      dir="ltr"
                      inputMode="numeric"
                      className="h-8 w-24"
                      value={edit.stock}
                      onChange={(e) => {
                        const digits = toEnglishDigits(e.target.value).replace(
                          /\D/g,
                          "",
                        );
                        patch(variant.id, {
                          stock: digits ? Number(digits) : 0,
                        });
                      }}
                    />
                    {variant.reservedStock > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        رزرو: {variant.reservedStock}
                      </p>
                    )}
                    {error && (
                      <p className="mt-1 text-xs text-destructive">{error}</p>
                    )}
                  </td>
                  <td className="p-3">
                    <PriceInput
                      className="h-8 w-36"
                      value={edit.price}
                      placeholder={product.basePrice.toLocaleString("en-US")}
                      onChange={(v) => patch(variant.id, { price: v })}
                    />
                  </td>
                  <td className="p-3">
                    <PriceInput
                      className="h-8 w-36"
                      value={edit.salePrice}
                      placeholder={
                        product.salePrice?.toLocaleString("en-US") ?? "—"
                      }
                      onChange={(v) => patch(variant.id, { salePrice: v })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <StepFooter onBack={onBack} isSaving={isSaving} disabled={hasErrors} />
    </form>
  );
}
