"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Shuffle } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from "@/redux/services/couponApi";
import {
  createCouponSchema,
  type CouponBody,
  type CouponDto,
  type CouponType,
} from "@/services/coupon/coupon.schema";
import {
  fromDateTimeLocal,
  generateCouponCode,
  getApiError,
  parseOptionalNumber,
  toDateTimeLocal,
} from "./coupon-helpers";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";

// Everything is a string in the form; it is converted and validated on submit
// with the SAME Zod schema the API uses, so the rules can never drift apart.
type FormValues = {
  code: string;
  type: CouponType;
  value: string;
  maxDiscount: string;
  minOrderAmount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const EMPTY: FormValues = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  maxDiscount: "",
  minOrderAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function toFormValues(c: CouponDto): FormValues {
  return {
    code: c.code,
    type: c.type,
    value: String(c.value),
    maxDiscount: c.maxDiscount !== null ? String(c.maxDiscount) : "",
    minOrderAmount: c.minOrderAmount !== null ? String(c.minOrderAmount) : "",
    usageLimit: c.usageLimit !== null ? String(c.usageLimit) : "",
    startsAt: toDateTimeLocal(c.startsAt),
    expiresAt: toDateTimeLocal(c.expiresAt),
    isActive: c.isActive,
  };
}

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a coupon to edit it; leave empty to create a new one. */
  coupon?: CouponDto | null;
}

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
}: CouponFormDialogProps) {
  const isEdit = !!coupon;

  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();
  const isSaving = creating || updating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(coupon ? toFormValues(coupon) : EMPTY);
  }, [open, coupon, reset]);

  const type = watch("type");

  const onSubmit = async (values: FormValues) => {
    const value = parseOptionalNumber(values.value);
    const minOrderAmount = parseOptionalNumber(values.minOrderAmount);
    const maxDiscount = parseOptionalNumber(values.maxDiscount);
    const usageLimit = parseOptionalNumber(values.usageLimit);

    // Catch unparsable numbers with a Persian message before Zod sees NaN
    const numberFields: [keyof FormValues, number | null][] = [
      ["value", value],
      ["minOrderAmount", minOrderAmount],
      ["maxDiscount", maxDiscount],
      ["usageLimit", usageLimit],
    ];
    let hasBadNumber = false;
    for (const [field, n] of numberFields) {
      if (n !== null && Number.isNaN(n)) {
        setError(field, { message: "یک عدد معتبر وارد کنید." });
        hasBadNumber = true;
      }
    }
    if (value === null) {
      setError("value", { message: "مقدار تخفیف را وارد کنید." });
      hasBadNumber = true;
    }
    if (hasBadNumber) return;

    const body: CouponBody = {
      code: values.code.trim(),
      type: values.type,
      value: value as number,
      minOrderAmount,
      // a cap only exists for percentage coupons
      maxDiscount: values.type === "PERCENTAGE" ? maxDiscount : null,
      usageLimit,
      startsAt: fromDateTimeLocal(values.startsAt),
      expiresAt: fromDateTimeLocal(values.expiresAt),
      isActive: values.isActive,
    };

    // Same rules as the server
    const parsed = createCouponSchema.safeParse(body);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormValues | undefined;
        if (field && field in EMPTY)
          setError(field, { message: issue.message });
      }
      return;
    }

    try {
      if (coupon) {
        await updateCoupon({ id: coupon.id, data: body }).unwrap();
        SuccessToast("کد تخفیف ویرایش شد");
      } else {
        await createCoupon(body).unwrap();
        SuccessToast("کد تخفیف ساخته شد");
      }
      onOpenChange(false);
    } catch (err) {
      ErrorToast(getApiError(err, "ذخیره کد تخفیف ناموفق بود"));
    }
  };

  const fieldError = (name: keyof FormValues) =>
    errors[name]?.message ? (
      <p className="mt-1 text-xs font-medium text-red-500">
        {errors[name]?.message}
      </p>
    ) : null;

  const errorClass = (name: keyof FormValues) =>
    errors[name] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <Dialog open={open} onOpenChange={(o) => !isSaving && onOpenChange(o)}>
      <DialogContent
        dir="rtl"
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader className="text-right">
          <DialogTitle>
            {isEdit ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}
          </DialogTitle>
          <DialogDescription>
            تخفیف روی مجموع سفارش (بعد از اعمال قیمت‌های حراج) محاسبه می‌شود.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {/* Code */}
          <div>
            <Label htmlFor="code">کد</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="code"
                dir="ltr"
                placeholder="SUMMER20"
                className={`font-mono uppercase ${errorClass("code")}`}
                {...register("code", {
                  required: "کد تخفیف را وارد کنید.",
                  onChange: (e) =>
                    setValue("code", e.target.value.toUpperCase()),
                })}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="ساخت کد تصادفی"
                onClick={() =>
                  setValue("code", generateCouponCode(), {
                    shouldValidate: true,
                  })
                }
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            {fieldError("code")}
          </div>

          {/* Type + value */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>نوع تخفیف</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">درصدی</SelectItem>
                      <SelectItem value="FIXED">مبلغ ثابت</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="value">
                {type === "PERCENTAGE" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}
              </Label>
              <Input
                id="value"
                inputMode="decimal"
                dir="ltr"
                placeholder={type === "PERCENTAGE" ? "20" : "50000"}
                className={`mt-1.5 ${errorClass("value")}`}
                {...register("value")}
              />
              {fieldError("value")}
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {type === "PERCENTAGE" && (
              <div>
                <Label htmlFor="maxDiscount">سقف تخفیف (تومان)</Label>
                <Input
                  id="maxDiscount"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="اختیاری"
                  className={`mt-1.5 ${errorClass("maxDiscount")}`}
                  {...register("maxDiscount")}
                />
                {fieldError("maxDiscount")}
              </div>
            )}

            <div>
              <Label htmlFor="minOrderAmount">حداقل مبلغ سفارش (تومان)</Label>
              <Input
                id="minOrderAmount"
                inputMode="numeric"
                dir="ltr"
                placeholder="اختیاری"
                className={`mt-1.5 ${errorClass("minOrderAmount")}`}
                {...register("minOrderAmount")}
              />
              {fieldError("minOrderAmount")}
            </div>

            <div>
              <Label htmlFor="usageLimit">سقف تعداد استفاده</Label>
              <Input
                id="usageLimit"
                inputMode="numeric"
                dir="ltr"
                placeholder="نامحدود"
                className={`mt-1.5 ${errorClass("usageLimit")}`}
                {...register("usageLimit")}
              />
              {fieldError("usageLimit")}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startsAt">شروع اعتبار</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                dir="ltr"
                className={`mt-1.5 ${errorClass("startsAt")}`}
                {...register("startsAt")}
              />
              {fieldError("startsAt")}
            </div>
            <div>
              <Label htmlFor="expiresAt">پایان اعتبار</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                dir="ltr"
                className={`mt-1.5 ${errorClass("expiresAt")}`}
                {...register("expiresAt")}
              />
              {fieldError("expiresAt")}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="isActive">فعال</Label>
              <p className="text-xs text-muted-foreground">
                کد غیرفعال در فروشگاه پذیرفته نمی‌شود.
              </p>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "ذخیره تغییرات" : "ساخت کد تخفیف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
