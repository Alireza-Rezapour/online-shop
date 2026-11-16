"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
} from "@/redux/services/attributeApi";
import type { AttributeDto } from "@/services/attribute/attribute.service";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";

// `valueId` instead of `id`: react-hook-form's useFieldArray overwrites `id`
const formSchema = z
  .object({
    name: z.string().trim().min(1, "نام ویژگی الزامی است").max(100),
    values: z
      .array(
        z.object({
          valueId: z.string().optional(),
          value: z.string().trim().min(1, "مقدار الزامی است").max(100),
          productCount: z.number(),
        }),
      )
      .min(1, "حداقل یک مقدار لازم است")
      .max(100),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.values.forEach((item, index) => {
      const key = item.value.trim().toLowerCase();
      if (key && seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["values", index, "value"],
          message: "مقدار تکراری است",
        });
      }
      seen.add(key);
    });
  });

type FormValues = z.infer<typeof formSchema>;

const emptyValue = { value: "", productCount: 0 };

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: AttributeDto | null;
  onSaved?: (attribute: AttributeDto) => void;
};

export function AttributeFormDialog({
  open,
  onOpenChange,
  attribute,
  onSaved,
}: Props) {
  const isEdit = !!attribute;

  const [createAttribute, { isLoading: isCreating }] =
    useCreateAttributeMutation();
  const [updateAttribute, { isLoading: isUpdating }] =
    useUpdateAttributeMutation();
  const isSaving = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", values: [emptyValue] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "values" });

  useEffect(() => {
    if (!open) return;
    reset({
      name: attribute?.name ?? "",
      values: attribute
        ? attribute.values.map((v) => ({
            valueId: v.id,
            value: v.value,
            productCount: v.productCount,
          }))
        : [emptyValue],
    });
  }, [open, attribute, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      values: values.values.map((v) => ({ id: v.valueId, value: v.value })),
    };

    try {
      const saved = attribute
        ? await updateAttribute({ id: attribute.id, data: payload }).unwrap()
        : await createAttribute(payload).unwrap();
      SuccessToast(
        attribute ? "ویژگی با موفقیت ویرایش شد" : "ویژگی با موفقیت ایجاد شد",
      );
      onOpenChange(false);
      onSaved?.(saved);

      onOpenChange(false);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره ویژگی ناموفق بود"));
    }
  };

  const valuesError = errors.values?.message ?? errors.values?.root?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "ویرایش ویژگی" : "ویژگی جدید"}</DialogTitle>
          <DialogDescription>
            مثلاً ویژگی «جنس» با مقدارهای «پنبه»، «کتان» و «پلی‌استر».
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="attribute-name">نام ویژگی</Label>
            <Input id="attribute-name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>مقدارها</Label>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const inUse = field.productCount > 0;
                const rowError = errors.values?.[index]?.value?.message;

                return (
                  <div key={field.id}>
                    <div className="flex items-center gap-1.5">
                      <Input
                        {...register(`values.${index}.value`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            append(emptyValue);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-secondary hover:text-destructive"
                        disabled={inUse}
                        title={
                          inUse
                            ? `این مقدار در ${field.productCount} محصول استفاده شده است`
                            : "حذف مقدار"
                        }
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    {rowError && (
                      <p className="mt-1 text-sm text-destructive">
                        {rowError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {valuesError && (
              <p className="text-sm text-destructive">{valuesError}</p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptyValue)}
            >
              <Plus className="size-4" />
              افزودن مقدار
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "ذخیره تغییرات" : "ایجاد ویژگی"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
