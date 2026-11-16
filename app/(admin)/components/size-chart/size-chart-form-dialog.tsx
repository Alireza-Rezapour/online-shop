"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";

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
  useCreateSizeChartMutation,
  useUpdateSizeChartMutation,
} from "@/redux/services/sizeChartApi";
import type { SizeChartDto } from "@/services/size-chart/size-chart.service";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";

// `sizeId` instead of `id`: react-hook-form's useFieldArray overwrites `id`
const formSchema = z
  .object({
    name: z.string().trim().min(1, "نام جدول سایز الزامی است").max(100),
    sizes: z
      .array(
        z.object({
          sizeId: z.string().optional(),
          name: z.string().trim().min(1, "نام سایز الزامی است").max(30),
          variantCount: z.number(),
        }),
      )
      .min(1, "حداقل یک سایز لازم است")
      .max(50),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.sizes.forEach((size, index) => {
      const key = size.name.trim().toLowerCase();
      if (key && seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["sizes", index, "name"],
          message: "سایز تکراری است",
        });
      }
      seen.add(key);
    });
  });

type FormValues = z.infer<typeof formSchema>;

const emptySize = { name: "", variantCount: 0 };

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chart: SizeChartDto | null;
  onSaved?: (chart: SizeChartDto) => void;
};

export function SizeChartFormDialog({
  open,
  onOpenChange,
  chart,
  onSaved,
}: Props) {
  const isEdit = !!chart;

  const [createChart, { isLoading: isCreating }] = useCreateSizeChartMutation();
  const [updateChart, { isLoading: isUpdating }] = useUpdateSizeChartMutation();
  const isSaving = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", sizes: [emptySize] },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sizes",
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: chart?.name ?? "",
      sizes: chart
        ? chart.sizes.map((s) => ({
            sizeId: s.id,
            name: s.name,
            variantCount: s.variantCount,
          }))
        : [emptySize],
    });
  }, [open, chart, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      sizes: values.sizes.map((s) => ({ id: s.sizeId, name: s.name })),
    };

    try {
      const saved = chart
        ? await updateChart({ id: chart.id, data: payload }).unwrap()
        : await createChart(payload).unwrap();
      SuccessToast(
        chart
          ? "سایز چارت با موفقیت ویرایش شد"
          : "سایز چارت با موفقیت ایجاد شد",
      );

      onSaved?.(saved);
      onOpenChange(false);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره جدول سایز ناموفق بود"));
    }
  };

  const sizesError = errors.sizes?.message ?? errors.sizes?.root?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? "ویرایش جدول سایز" : "جدول سایز جدید"}
          </DialogTitle>
          <DialogDescription>
            ترتیب سایزها همان ترتیب نمایش آن‌ها در فروشگاه است.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="chart-name">نام جدول سایز</Label>
            <Input
              id="chart-name"
              placeholder="مثلاً: لباس مردانه"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>سایزها</Label>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const inUse = field.variantCount > 0;
                const rowError = errors.sizes?.[index]?.name?.message;

                return (
                  <div key={field.id}>
                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-col">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-5"
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                          aria-label="انتقال به بالا"
                        >
                          <ChevronUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-5"
                          disabled={index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                          aria-label="انتقال به پایین"
                        >
                          <ChevronDown className="size-3.5" />
                        </Button>
                      </div>

                      <Input
                        dir="ltr"
                        placeholder="M"
                        {...register(`sizes.${index}.name`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            append(emptySize);
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
                            ? `این سایز در ${field.variantCount} تنوع محصول استفاده شده است`
                            : "حذف سایز"
                        }
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    {rowError && (
                      <p className="mt-1 ps-8 text-sm text-destructive">
                        {rowError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {sizesError && (
              <p className="text-sm text-destructive">{sizesError}</p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(emptySize)}
            >
              <Plus className="size-4" />
              افزودن سایز
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "ذخیره تغییرات" : "ایجاد جدول سایز"}
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
