"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { useGetAttributesQuery } from "@/redux/services/attributeApi";
import {
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from "@/redux/services/categoryApi";
import { useSaveProductAttributesMutation } from "@/redux/services/productApi";
import type { AttributeDto } from "@/services/attribute/attribute.service";
import type { ProductAdminDto } from "@/services/product/product.service";
import { getErrorMessage } from "@/app/(admin)/lib/product/product-utils";
import { StepFooter } from "../step-footer";
import { AttributeFormDialog } from "../../attribute/attribute-form-dialog";

const NONE = "none";

type Props = {
  product: ProductAdminDto;
  onSaved: (product: ProductAdminDto) => void;
  onBack: () => void;
};

export function StepAttributes({ product, onSaved, onBack }: Props) {
  const { data: category, isLoading: loadingCategory } = useGetCategoryQuery(
    product.categoryId,
  );
  const { data: attributes = [], isLoading: loadingAttributes } =
    useGetAttributesQuery();
  const [updateCategory] = useUpdateCategoryMutation();
  const [saveAttributes, { isLoading: isSaving }] =
    useSaveProductAttributesMutation();

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.attributes.map((a) => [a.attributeId, a.attributeValueId]),
    ),
  );
  const [dialog, setDialog] = useState<{
    open: boolean;
    attribute: AttributeDto | null;
  }>({ open: false, attribute: null });

  const categoryAttributes = useMemo(() => {
    const ids = new Set(category?.attributes.map((a) => a.id));
    return attributes.filter((a) => ids.has(a.id));
  }, [attributes, category]);

  // A brand-new attribute is linked to this product's category right away
  const handleAttributeSaved = async (saved: AttributeDto) => {
    if (!category || category.attributes.some((a) => a.id === saved.id)) return;
    try {
      await updateCategory({
        id: product.categoryId,
        data: {
          attributeIds: [...category.attributes.map((a) => a.id), saved.id],
        },
      }).unwrap();
    } catch (error) {
      ErrorToast(getErrorMessage(error, "اتصال ویژگی به دسته‌بندی ناموفق بود"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pairs = categoryAttributes.flatMap((attribute) => {
      const valueId = selected[attribute.id];
      return valueId && attribute.values.some((v) => v.id === valueId)
        ? [{ attributeId: attribute.id, attributeValueId: valueId }]
        : [];
    });

    try {
      const saved = await saveAttributes({
        id: product.id,
        data: { attributes: pairs },
      }).unwrap();
      SuccessToast("ویژگی‌ها ذخیره شد");
      onSaved(saved);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره ویژگی‌ها ناموفق بود"));
    }
  };

  if (loadingCategory || loadingAttributes) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted/60" />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          ویژگی‌های دسته‌بندی «{category?.name}». هر ویژگی یک مقدار دارد و پر
          کردن همه اجباری نیست.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDialog({ open: true, attribute: null })}
        >
          <Plus className="size-4" />
          ویژگی جدید
        </Button>
      </div>

      {categoryAttributes.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          این دسته‌بندی هنوز ویژگی ندارد. می‌توانید یک ویژگی جدید بسازید یا از
          این مرحله عبور کنید.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {categoryAttributes.map((attribute) => (
          <div key={attribute.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{attribute.name}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDialog({ open: true, attribute })}
              >
                <Plus className="size-4" />
                مقدار جدید
              </Button>
            </div>
            <Select
              value={selected[attribute.id] ?? NONE}
              onValueChange={(v) =>
                setSelected((prev) => {
                  const next = { ...prev };
                  if (v === NONE) delete next[attribute.id];
                  else next[attribute.id] = v;
                  return next;
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>بدون مقدار</SelectItem>
                {attribute.values.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <StepFooter onBack={onBack} isSaving={isSaving} />

      <AttributeFormDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
        attribute={dialog.attribute}
        onSaved={handleAttributeSaved}
      />
    </form>
  );
}
