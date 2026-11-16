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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/app/hooks/use-debounce-value";
import { todayJalali } from "@/lib/jalali";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { FocalPointPicker } from "./focal-point-picker";
import { HeroLivePreview } from "./hero-live-preview";
import { PositionPicker } from "./position-picker";
import { fromJalaliDate, toJalaliDate } from "../../lib/hero/hero-date";
import { HeroCtaType, HeroSlide } from "./hero-types";
import {
  AdminHeroSlide,
  useCreateHeroSlideMutation,
  useGetHeroCtaOptionsQuery,
  useUpdateHeroSlideMutation,
} from "@/redux/services/heroSlideApi";
import { HERO_CTA_TYPE_OPTIONS } from "../../lib/hero/hero-labels";
import { SearchableCombobox } from "@/app/components/shared/searchable-combobox";
import { JalaliDatePicker } from "@/app/components/shared/jalali-date-picker";
import { FileUploadField } from "../shared/file-upload-field";
import { UploadPurpose } from "@/services/storage/storage.types";
import { getPublicUrl } from "@/services/storage/storage.public-url";

/* ------------------------------------------------------------------ */
/* Schema                                                               */
/* ------------------------------------------------------------------ */

const positionEnum = z.enum([
  "TOP_LEFT",
  "TOP_CENTER",
  "TOP_RIGHT",
  "CENTER_LEFT",
  "CENTER",
  "CENTER_RIGHT",
  "BOTTOM_LEFT",
  "BOTTOM_CENTER",
  "BOTTOM_RIGHT",
]);
const ctaTypeEnum = z.enum(["PRODUCT", "COLLECTION", "CATEGORY"]);
const jalaliSchema = z.object({
  jy: z.number(),
  jm: z.number(),
  jd: z.number(),
});

const FormSchema = z
  .object({
    eyebrow: z.string().max(80, "حداکثر ۸۰ کاراکتر"),
    title: z.string().trim().min(1, "عنوان الزامی است").max(200),
    description: z.string().max(1000, "حداکثر ۱۰۰۰ کاراکتر"),
    image: z.string().trim().min(1, "آدرس تصویر الزامی است").max(500),
    mobileImage: z.string().trim().max(500),
    imageAlt: z.string().max(200),
    focalX: z.number().int().min(0).max(100),
    focalY: z.number().int().min(0).max(100),
    desktopPosition: positionEnum,
    mobilePosition: positionEnum,
    textTone: z.enum(["LIGHT", "DARK"]),
    isActive: z.boolean(),
    ctaEnabled: z.boolean(),
    ctaLabel: z.string().max(50, "حداکثر ۵۰ کاراکتر"),
    ctaType: ctaTypeEnum.optional(),
    ctaTargetId: z.string().optional(),
    startsAt: jalaliSchema.nullable(),
    endsAt: jalaliSchema.nullable(),
  })
  .superRefine((d, ctx) => {
    if (d.ctaEnabled) {
      if (!d.ctaLabel.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "متن دکمه الزامی است",
          path: ["ctaLabel"],
        });
      }
      if (!d.ctaType) {
        ctx.addIssue({
          code: "custom",
          message: "نوع مقصد را انتخاب کنید",
          path: ["ctaType"],
        });
      }
      if (!d.ctaTargetId) {
        ctx.addIssue({
          code: "custom",
          message: "مقصد را انتخاب کنید",
          path: ["ctaTargetId"],
        });
      }
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

const FIELD_NAMES = [
  "eyebrow",
  "title",
  "description",
  "image",
  "mobileImage",
  "imageAlt",
  "ctaLabel",
  "ctaType",
  "ctaTargetId",
  "startsAt",
  "endsAt",
] as const;

function toFormValues(slide?: AdminHeroSlide): FormValues {
  return {
    eyebrow: slide?.eyebrow ?? "",
    title: slide?.title ?? "",
    description: slide?.description ?? "",
    image: slide?.image ?? "",
    mobileImage: slide?.mobileImage ?? "",
    imageAlt: slide?.imageAlt ?? "",
    focalX: slide?.focalX ?? 50,
    focalY: slide?.focalY ?? 50,
    desktopPosition: slide?.desktopPosition ?? "CENTER_LEFT",
    mobilePosition: slide?.mobilePosition ?? "CENTER",
    textTone: slide?.textTone ?? "LIGHT",
    isActive: slide?.isActive ?? true,
    ctaEnabled: !!slide?.ctaType,
    ctaLabel: slide?.ctaLabel ?? "",
    ctaType: slide?.ctaType ?? undefined,
    ctaTargetId: slide?.ctaTargetId ?? undefined,
    startsAt: slide?.startsAt ? toJalaliDate(new Date(slide.startsAt)) : null,
    endsAt: slide?.endsAt ? toJalaliDate(new Date(slide.endsAt)) : null,
  };
}

/** What the storefront component would receive for the values typed so far. */
function toPreviewSlide(v: FormValues): HeroSlide | null {
  const image = v.image.trim();
  if (!image) return null;
  return {
    id: "preview",
    eyebrow: v.eyebrow.trim() || null,
    title: v.title || "عنوان اسلاید",
    description: v.description.trim() || null,
    image,
    mobileImage: v.mobileImage.trim() || null,
    imageAlt: v.imageAlt.trim() || null,
    focalX: v.focalX,
    focalY: v.focalY,
    ctaLabel: v.ctaEnabled ? v.ctaLabel.trim() || "متن دکمه" : null,
    ctaType: v.ctaEnabled ? (v.ctaType ?? "PRODUCT") : null,
    ctaTargetId: null,
    ctaSlug: v.ctaEnabled ? "preview" : null,
    desktopPosition: v.desktopPosition,
    mobilePosition: v.mobilePosition,
    textTone: v.textTone,
    sortOrder: 0,
    isActive: true,
    startsAt: null,
    endsAt: null,
  };
}

/* ------------------------------------------------------------------ */
/* Small layout helpers                                                 */
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

interface HeroSlideFormProps {
  mode: "create" | "edit";
  slide?: AdminHeroSlide;
  /** Used for new slides so they land at the end of the list. */
  nextSortOrder?: number;
}

export function HeroSlideForm({
  mode,
  slide,
  nextSortOrder = 0,
}: HeroSlideFormProps) {
  const router = useRouter();
  const [createHeroSlide, { isLoading: isCreating }] =
    useCreateHeroSlideMutation();
  const [updateHeroSlide, { isLoading: isUpdating }] =
    useUpdateHeroSlideMutation();
  const isSubmitting = isCreating || isUpdating;

  const [targetSearch, setTargetSearch] = useState("");
  const debouncedTargetSearch = useDebouncedValue(targetSearch, 300);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: toFormValues(slide),
  });

  const values = watch();
  const { ctaEnabled, ctaType, ctaTargetId } = values;
  const previewSlide = toPreviewSlide(values);

  const { data: ctaOptions, isFetching: isLoadingOptions } =
    useGetHeroCtaOptionsQuery(
      {
        type: ctaType as HeroCtaType,
        search: debouncedTargetSearch || undefined,
      },
      { skip: !ctaEnabled || !ctaType },
    );

  // In edit mode, seed the combobox with the saved target's name so it never
  // shows a raw id while the options are loading.
  const fetched = (ctaOptions ?? []).map((o) => ({
    value: o.id,
    label: o.label,
    description: o.slug,
  }));
  const comboboxOptions =
    slide?.ctaTarget &&
    slide.ctaTargetId === ctaTargetId &&
    !fetched.some((o) => o.value === ctaTargetId)
      ? [
          {
            value: slide.ctaTarget.id,
            label: slide.ctaTarget.label,
            description: slide.ctaTarget.slug,
          },
          ...fetched,
        ]
      : fetched;

  // Scheduling years: this year and next 20 (the picker opens on
  // maxYear - 20, which is this year), plus any older year already saved.
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
      eyebrow: v.eyebrow.trim() || null,
      title: v.title,
      description: v.description.trim() || null,
      image: v.image.trim(),
      mobileImage: v.mobileImage.trim() || null,
      imageAlt: v.imageAlt.trim() || null,
      focalX: v.focalX,
      focalY: v.focalY,
      desktopPosition: v.desktopPosition,
      mobilePosition: v.mobilePosition,
      textTone: v.textTone,
      isActive: v.isActive,
      ctaLabel: v.ctaEnabled ? v.ctaLabel.trim() : null,
      ctaType: v.ctaEnabled ? (v.ctaType ?? null) : null,
      ctaTargetId: v.ctaEnabled ? (v.ctaTargetId ?? null) : null,
      startsAt: v.startsAt ? fromJalaliDate(v.startsAt) : null,
      endsAt: v.endsAt ? fromJalaliDate(v.endsAt, true) : null,
    };

    try {
      if (mode === "create") {
        await createHeroSlide({ ...body, sortOrder: nextSortOrder }).unwrap();
        SuccessToast("اسلاید هیرو ایجاد شد");
      } else if (slide) {
        await updateHeroSlide({ id: slide.id, body }).unwrap();
        SuccessToast("تغییرات ذخیره شد");
      }
      router.push("/admin/hero");
    } catch (err) {
      const e = err as {
        data?: {
          error?: string;
          issues?: { path: string; message: string }[];
        };
      };
      const issues = e.data?.issues ?? [];
      issues.forEach((issue) => {
        const name = FIELD_NAMES.find((f) => f === issue.path);
        if (name) setError(name, { message: issue.message });
      });
      const message = issues.length
        ? "لطفاً خطاهای فرم را بررسی کنید."
        : (e.data?.error ?? "خطایی رخ داد. دوباره تلاش کنید.");
      setSubmitError(message);
      ErrorToast(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Section
        title="پیش‌نمایش زنده"
        description="همان کامپوننت فروشگاه، با مقادیری که الان وارد کرده‌اید. برای دیدن چیدمان موبایل، اسلاید را در فروشگاه با حالت موبایل مرورگر ببینید."
      >
        <HeroLivePreview slide={previewSlide} />
      </Section>

      <Section title="محتوا">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">عنوان</Label>
            <Textarea
              id="title"
              rows={2}
              {...register("title")}
              placeholder={"لباسی که با تو\nآرام‌تر حرف می‌زند"}
            />
            <p className="text-xs text-muted-foreground">
              هر خط جدید یک خط در عنوان است. در عنوان چندخطی، خط آخر سبک‌تر
              نمایش داده می‌شود.
            </p>
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eyebrow">پیش‌عنوان (اختیاری)</Label>
            <Input
              id="eyebrow"
              {...register("eyebrow")}
              placeholder="کالکشن پاییز ۱۴۰۵"
            />
            <FieldError message={errors.eyebrow?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">توضیحات (اختیاری)</Label>
            <Textarea id="description" rows={3} {...register("description")} />
            <p className="text-xs text-muted-foreground">
              در موبایل نمایش داده نمی‌شود و در دسکتاپ حداکثر دو خط دیده می‌شود.
            </p>
            <FieldError message={errors.description?.message} />
          </div>
        </div>
      </Section>

      <Section
        title="تصویر"
        description="تصویر عریض برای دسکتاپ و در صورت نیاز یک تصویر جداگانه برای موبایل."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>تصویر دسکتاپ</Label>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <FileUploadField
                  purpose={UploadPurpose.HERO_SLIDE_IMAGE}
                  label="تصویر دسکتاپ"
                  value={field.value || null}
                  onChange={(key) => field.onChange(key ?? "")}
                />
              )}
            />
            <FieldError message={errors.image?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>تصویر موبایل (اختیاری)</Label>
            <Controller
              control={control}
              name="mobileImage"
              render={({ field }) => (
                <FileUploadField
                  purpose={UploadPurpose.HERO_SLIDE_IMAGE}
                  label="تصویر موبایل"
                  value={field.value || null}
                  onChange={(key) => field.onChange(key ?? "")}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              خالی = استفاده از تصویر دسکتاپ
            </p>
            <FieldError message={errors.mobileImage?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>نقطه‌ی تمرکز تصویر</Label>
            <p className="text-xs text-muted-foreground">
              وقتی تصویر در صفحه‌های مختلف برش می‌خورد، این نقطه (مثلاً چهره یا
              لباس) در کادر می‌ماند.
            </p>
            <FocalPointPicker
              src={getPublicUrl(values.image) ?? ""}
              x={values.focalX}
              y={values.focalY}
              onChange={(x, y) => {
                setValue("focalX", x, { shouldDirty: true });
                setValue("focalY", y, { shouldDirty: true });
              }}
            />
          </div>
        </div>
      </Section>

      <Section
        title="چیدمان متن"
        description="جای متن روی تصویر را برای دسکتاپ و موبایل جدا انتخاب کنید و رنگ متن را با تصویر هماهنگ کنید."
      >
        <div className="flex flex-wrap gap-8">
          <Controller
            control={control}
            name="desktopPosition"
            render={({ field }) => (
              <PositionPicker
                label="جای متن در دسکتاپ"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="mobilePosition"
            render={({ field }) => (
              <PositionPicker
                label="جای متن در موبایل"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="space-y-2">
            <Label>رنگ متن</Label>
            <Controller
              control={control}
              name="textTone"
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-label="رنگ متن"
                  className="flex gap-2"
                >
                  {(
                    [
                      {
                        value: "LIGHT",
                        title: "متن روشن",
                        hint: "برای تصویر تیره",
                      },
                      {
                        value: "DARK",
                        title: "متن تیره",
                        hint: "برای تصویر روشن",
                      },
                    ] as const
                  ).map((opt) => {
                    const selected = field.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "flex w-32 flex-col items-start gap-0.5 rounded-md border p-3 text-start transition-colors",
                          "hover:border-ring focus-visible:outline-2 focus-visible:outline-ring",
                          selected && "border-foreground bg-muted",
                        )}
                      >
                        <span className="text-sm font-medium">{opt.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {opt.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </div>
      </Section>

      <Section title="دکمه‌ی فراخوان (اختیاری)">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="ctaEnabled">نمایش دکمه</Label>
            <p className="text-xs text-muted-foreground">
              {ctaEnabled
                ? "متن و مقصد دکمه الزامی است."
                : "بدون دکمه، اسلاید فقط تصویر و متن دارد."}
            </p>
          </div>
          <Controller
            control={control}
            name="ctaEnabled"
            render={({ field }) => (
              <Switch
                id="ctaEnabled"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    setValue("ctaLabel", "");
                    setValue("ctaType", undefined);
                    setValue("ctaTargetId", undefined);
                    setTargetSearch("");
                  }
                }}
              />
            )}
          />
        </div>

        {ctaEnabled && (
          <div className="grid gap-4 rounded-md border bg-muted/30 p-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ctaLabel">متن دکمه</Label>
              <Input
                id="ctaLabel"
                {...register("ctaLabel")}
                placeholder="دیدن کالکشن"
              />
              <FieldError message={errors.ctaLabel?.message} />
            </div>

            <div className="space-y-2">
              <Label>نوع مقصد</Label>
              <Controller
                control={control}
                name="ctaType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("ctaTargetId", undefined);
                      setTargetSearch("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نوع مقصد..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HERO_CTA_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.ctaType?.message} />
            </div>

            <div className="space-y-2">
              <Label>مقصد</Label>
              <Controller
                control={control}
                name="ctaTargetId"
                render={({ field }) => (
                  <SearchableCombobox
                    value={field.value ?? null}
                    onChange={field.onChange}
                    onSearchChange={setTargetSearch}
                    options={comboboxOptions}
                    isLoading={isLoadingOptions}
                    disabled={!ctaType}
                    placeholder={
                      ctaType
                        ? "انتخاب مقصد..."
                        : "ابتدا نوع مقصد را انتخاب کنید"
                    }
                    searchPlaceholder="جستجو..."
                    emptyText="موردی یافت نشد."
                  />
                )}
              />
              <FieldError message={errors.ctaTargetId?.message} />
            </div>
          </div>
        )}
      </Section>

      <Section
        title="نمایش و زمان‌بندی"
        description="بدون تاریخ، اسلاید تا زمانی که فعال است نمایش داده می‌شود."
      >
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label htmlFor="isActive">فعال</Label>
            <p className="text-xs text-muted-foreground">
              اسلایدهای غیرفعال در فروشگاه نمایش داده نمی‌شوند.
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
          <Link href="/admin/hero">انصراف</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "ایجاد اسلاید" : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
