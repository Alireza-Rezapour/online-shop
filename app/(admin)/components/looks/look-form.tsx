/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/utils";
import { todayJalali } from "@/lib/jalali";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { JalaliDatePicker } from "@/app/components/shared/jalali-date-picker";
import { FileUploadField } from "../shared/file-upload-field";
import { UploadPurpose } from "@/services/storage/storage.types";
import {
  fromJalaliDate,
  toJalaliDate,
} from "@/app/(admin)/lib/hero/hero-date";
import {
  useCreateLookMutation,
  useUpdateLookMutation,
  type AdminLook,
} from "@/redux/services/lookApi";
import { MAX_LOOK_ITEMS } from "@/services/look/look.types";
import { LookProductPicker } from "./look-product-picker";

/* ------------------------------------------------------------------ */
/* Schema                                                               */
/* ------------------------------------------------------------------ */

const jalaliSchema = z.object({ jy: z.number(), jm: z.number(), jd: z.number() });

const productSchema = z.object({
  productId: z.string(),
  title: z.string(),
  slug: z.string(),
  coverImageUrl: z.string().nullable(),
  basePrice: z.number(),
  salePrice: z.number().nullable(),
  currentPrice: z.number(),
  isPublished: z.boolean(),
});

const FormSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان الزامی است").max(120, "حداکثر ۱۲۰ کاراکتر"),
    slug: z.string().trim().max(120, "حداکثر ۱۲۰ کاراکتر"),
    description: z.string().max(1000, "حداکثر ۱۰۰۰ کاراکتر"),
    image: z.string().trim().min(1, "تصویر ست الزامی است").max(500),
    products: z.array(productSchema).max(MAX_LOOK_ITEMS, `حداکثر ${MAX_LOOK_ITEMS} محصول`),
    isPublished: z.boolean(),
    startsAt: jalaliSchema.nullable(),
    endsAt: jalaliSchema.nullable(),
  })
  .superRefine((d, ctx) => {
    if (d.isPublished && d.products.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "برای انتشار، حداقل یک محصول به ست اضافه کنید",
        path: ["products"],
      });
    }
    if (d.startsAt && d.endsAt) {
      if (fromJalaliDate(d.endsAt, true) <= fromJalaliDate(d.startsAt)) {
        ctx.addIssue({
          code: "custom",
          message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
          path: ["endsAt"],
        });
      }
    }
  });

type FormValues = z.infer<typeof FormSchema>;
type FieldName = keyof FormValues;

// Server issue path -> form field
const SERVER_FIELDS: Record<string, FieldName> = {
  title: "title",
  slug: "slug",
  description: "description",
  image: "image",
  productIds: "products",
  startsAt: "startsAt",
  endsAt: "endsAt",
};

function toFormValues(look?: AdminLook): FormValues {
  return {
    title: look?.title ?? "",
    slug: look?.slug ?? "",
    description: look?.description ?? "",
    image: look?.image ?? "",
    products: look?.items ?? [],
    isPublished: look?.isPublished ?? false,
    startsAt: look?.startsAt ? toJalaliDate(new Date(look.startsAt)) : null,
    endsAt: look?.endsAt ? toJalaliDate(new Date(look.endsAt)) : null,
  };
}

/* ------------------------------------------------------------------ */
/* Layout helpers                                                       */
/* ------------------------------------------------------------------ */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

/* ------------------------------------------------------------------ */
/* Form                                                                 */
/* ------------------------------------------------------------------ */

interface LookFormProps {
  mode: "create" | "edit";
  look?: AdminLook;
  /** Used for new looks so they land at the end of the list. */
  nextSortOrder?: number;
}

export function LookForm({ mode, look, nextSortOrder = 0 }: LookFormProps) {
  const router = useRouter();
  const [createLook, { isLoading: isCreating }] = useCreateLookMutation();
  const [updateLook, { isLoading: isUpdating }] = useUpdateLookMutation();
  const isSubmitting = isCreating || isUpdating;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: toFormValues(look),
  });

  const values = watch();
  const total = values.products.reduce((sum, p) => sum + p.currentPrice, 0);

  const thisYear = todayJalali().jy;
  const minYear = Math.min(
    thisYear - 1,
    values.startsAt?.jy ?? thisYear,
    values.endsAt?.jy ?? thisYear,
  );
  const maxYear = thisYear + 20;

  const onSubmit = async (v: FormValues) => {
    setSubmitError(null);

    const body = {
      title: v.title,
      slug: v.slug.trim() || null, // empty = generated from the title
      description: v.description.trim() || null,
      image: v.image.trim(),
      productIds: v.products.map((p) => p.productId),
      isPublished: v.isPublished,
      startsAt: v.startsAt ? fromJalaliDate(v.startsAt) : null,
      endsAt: v.endsAt ? fromJalaliDate(v.endsAt, true) : null,
    };

    try {
      if (mode === "create") {
        await createLook({ ...body, sortOrder: nextSortOrder }).unwrap();
        SuccessToast("ست ایجاد شد");
      } else if (look) {
        await updateLook({ id: look.id, body }).unwrap();
        SuccessToast("تغییرات ذخیره شد");
      }
      router.push("/admin/looks");
    } catch (err) {
      const e = err as {
        data?: { error?: string; issues?: { path: string; message: string }[] };
      };
      const issues = e.data?.issues ?? [];
      issues.forEach((issue) => {
        const name = SERVER_FIELDS[issue.path];
        if (name) setError(name, { message: issue.message });
      });
      const message = issues.length
        ? (issues[0]?.message ?? "لطفاً خطاهای فرم را بررسی کنید.")
        : (e.data?.error ?? "خطایی رخ داد. دوباره تلاش کنید.");
      setSubmitError(message);
      ErrorToast(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Section title="اطلاعات ست">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">عنوان</Label>
            <Input id="title" {...register("title")} placeholder="استایل پاییزی" />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">توضیحات (اختیاری)</Label>
            <Textarea id="description" rows={3} {...register("description")} />
            <p className="text-xs text-muted-foreground">
              در فروشگاه حداکثر سه خط نمایش داده می‌شود.
            </p>
            <FieldError message={errors.description?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="slug">نشانی یکتا (اختیاری)</Label>
            <Input
              id="slug"
              dir="ltr"
              className="text-start"
              {...register("slug")}
              placeholder="خالی = ساخته‌شدن خودکار از عنوان"
            />
            <FieldError message={errors.slug?.message} />
          </div>
        </div>
      </Section>

      <Section
        title="تصویر ست"
        description="عکس اصلی مدل با ست کامل. بهتر است عمودی (نسبت ۴ به ۵) باشد."
      >
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <FileUploadField
              purpose={UploadPurpose.LOOK_IMAGE}
              label="تصویر ست"
              value={field.value || null}
              onChange={(key) => field.onChange(key ?? "")}
            />
          )}
        />
        <FieldError message={errors.image?.message} />
      </Section>

      <Section
        title="محصولات ست"
        description="محصولاتی که در این ست دیده می‌شوند. مشتری با کلیک روی هر کدام به صفحه‌ی محصول می‌رود."
      >
        <Controller
          control={control}
          name="products"
          render={({ field }) => (
            <LookProductPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {values.products.length > 0 && (
          <p className="text-sm">
            قیمت کل ست:{" "}
            <span className="font-semibold">{formatPrice(total, "تومان")}</span>
          </p>
        )}
        <FieldError message={errors.products?.message} />
      </Section>

      <Section
        title="انتشار و زمان‌بندی"
        description="بدون تاریخ، ست تا زمانی که منتشر شده است نمایش داده می‌شود."
      >
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label htmlFor="isPublished">منتشر شده</Label>
            <p className="text-xs text-muted-foreground">
              ست‌های منتشرنشده در صفحه‌ی اصلی نمایش داده نمی‌شوند.
            </p>
          </div>
          <Controller
            control={control}
            name="isPublished"
            render={({ field }) => (
              <Switch
                id="isPublished"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              { name: "startsAt", label: "شروع نمایش (اختیاری)" },
              { name: "endsAt", label: "پایان نمایش (اختیاری)" },
            ] as const
          ).map(({ name, label }) => (
            <div key={name} className="space-y-2">
              <Label>{label}</Label>
              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <JalaliDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="انتخاب تاریخ"
                        hasError={!!errors[name]}
                        minYear={minYear}
                        maxYear={maxYear}
                      />
                    </div>
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="پاک کردن تاریخ"
                        onClick={() => field.onChange(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                )}
              />
              <FieldError message={errors[name]?.message} />
            </div>
          ))}
        </div>
      </Section>

      {submitError && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-2 pb-6">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/looks">انصراف</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "ایجاد ست" : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
