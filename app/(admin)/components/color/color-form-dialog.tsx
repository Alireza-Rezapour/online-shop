"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
  useCreateColorMutation,
  useUpdateColorMutation,
} from "@/redux/services/colorApi";
import type { ColorDto } from "@/services/color/color.service";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";

const hexRegex = /^#?[0-9a-fA-F]{6}$/;

const formSchema = z.object({
  name: z.string().trim().min(1, "نام رنگ الزامی است").max(50),
  hex: z.string().trim().regex(hexRegex, "کد رنگ باید مثل #1A2B3C باشد"),
  code: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]{2,10}$/, "کد باید ۲ تا ۱۰ حرف انگلیسی یا عدد باشد"),
});

type FormValues = z.infer<typeof formSchema>;

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: string; error?: string } })?.data;
  return data?.message ?? data?.error ?? fallback;
}

function normalizeHex(value: string) {
  return `#${value.replace("#", "").toUpperCase()}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color: ColorDto | null;
  onSaved?: (color: ColorDto) => void;
};

export function ColorFormDialog({ open, onOpenChange, color, onSaved }: Props) {
  const isEdit = !!color;
  const codeLocked = !!color && color.variantCount > 0;

  const [createColor, { isLoading: isCreating }] = useCreateColorMutation();
  const [updateColor, { isLoading: isUpdating }] = useUpdateColorMutation();
  const isSaving = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", hex: "#000000", code: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: color?.name ?? "",
      hex: color?.hex ?? "#000000",
      code: color?.code ?? "",
    });
  }, [open, color, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      hex: normalizeHex(values.hex),
      code: values.code.toUpperCase(),
    };

    try {
      const saved = color
        ? await updateColor({ id: color.id, data: payload }).unwrap()
        : await createColor(payload).unwrap();
      SuccessToast(
        color
          ? "دسته‌بندی با موفقیت ویرایش شد"
          : "دسته‌بندی با موفقیت ایجاد شد",
      );

      onSaved?.(saved);
      onOpenChange(false);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره رنگ ناموفق بود"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "ویرایش رنگ" : "رنگ جدید"}</DialogTitle>
          <DialogDescription>
            نام، کد رنگ و کد کوتاه (برای ساخت SKU) را وارد کنید.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="color-name">نام</Label>
            <Input
              id="color-name"
              placeholder="مثلاً: مشکی"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-hex">کد رنگ (Hex)</Label>
            <Controller
              control={control}
              name="hex"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="انتخاب رنگ"
                    value={
                      hexRegex.test(field.value)
                        ? `#${field.value.replace("#", "").toLowerCase()}`
                        : "#000000"
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                    className="size-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                  />
                  <Input
                    id="color-hex"
                    dir="ltr"
                    placeholder="#1A2B3C"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </div>
              )}
            />
            {errors.hex && (
              <p className="text-sm text-destructive">{errors.hex.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-code">کد کوتاه</Label>
            <Input
              id="color-code"
              dir="ltr"
              placeholder="BLK"
              disabled={codeLocked}
              className="uppercase"
              {...register("code")}
            />
            {codeLocked && (
              <p className="text-xs text-muted-foreground">
                این رنگ در تنوع محصولات استفاده شده و کد آن قابل تغییر نیست.
              </p>
            )}
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "ذخیره تغییرات" : "ایجاد رنگ"}
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
