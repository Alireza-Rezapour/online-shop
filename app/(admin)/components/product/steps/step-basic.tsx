"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import {
  useCreateProductDraftMutation,
  useUpdateProductBasicMutation,
} from "@/redux/services/productApi";
import type { ProductAdminDto } from "@/services/product/product.service";
import {
  buildCategoryTree,
  flattenTree,
  getCategoryPath,
} from "@/app/(admin)/lib/category/category-utils";
import { getErrorMessage } from "@/app/(admin)/lib/product/product-utils";
import { slugify } from "../../shared/slugify";
import { PriceInput } from "../../price-input";
import { StepFooter } from "../step-footer";
import { CategoryFormDialog } from "../../category/category-form-dialog";

const slugRegex = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/;

const formSchema = z
  .object({
    title: z.string().trim().min(1, "عنوان محصول الزامی است").max(200),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "اسلاگ الزامی است")
      .max(200)
      .regex(slugRegex, "اسلاگ فقط می‌تواند شامل حروف، عدد و خط تیره باشد"),
    categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
    description: z.string().trim().max(10000),
    basePrice: z.number().int().min(1, "قیمت پایه را وارد کنید"),
    salePrice: z.number().int().min(1).nullable(),
  })
  .refine((d) => d.salePrice == null || d.salePrice < d.basePrice, {
    message: "قیمت حراج باید کمتر از قیمت پایه باشد",
    path: ["salePrice"],
  });

type FormValues = z.infer<typeof formSchema>;

type Props = {
  product: ProductAdminDto | null;
  onSaved: (product: ProductAdminDto) => void;
};

export function StepBasic({ product, onSaved }: Props) {
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [categoryDialog, setCategoryDialog] = useState(false);

  const { data: categories = [] } = useGetCategoriesQuery();
  const allNodes = useMemo(
    () => flattenTree(buildCategoryTree(categories)),
    [categories],
  );
  const byId = useMemo(
    () => new Map(allNodes.map((n) => [n.id, n])),
    [allNodes],
  );

  const [createDraft, { isLoading: isCreating }] =
    useCreateProductDraftMutation();
  const [updateBasic, { isLoading: isUpdating }] =
    useUpdateProductBasicMutation();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product?.title ?? "",
      slug: product?.slug ?? "",
      categoryId: product?.categoryId ?? "",
      description: product?.description ?? "",
      basePrice: product?.basePrice ?? 0,
      salePrice: product?.salePrice ?? null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      slug: values.slug,
      categoryId: values.categoryId,
      description: values.description || null,
      basePrice: values.basePrice,
      salePrice: values.salePrice,
    };

    try {
      const saved = product
        ? await updateBasic({ id: product.id, data: payload }).unwrap()
        : await createDraft(payload).unwrap();
      SuccessToast(
        product ? "اطلاعات محصول ذخیره شد" : "پیش‌نویس محصول ایجاد شد",
      );
      onSaved(saved);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره محصول ناموفق بود"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product-title">عنوان محصول</Label>
          <Input
            id="product-title"
            {...register("title", {
              onChange: (e) => {
                if (!slugTouched) setValue("slug", slugify(e.target.value));
              },
            })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-slug">اسلاگ</Label>
          <Input
            id="product-slug"
            dir="ltr"
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label>دسته‌بندی</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCategoryDialog(true)}
            >
              <Plus className="size-4" />
              دسته‌بندی جدید
            </Button>
          </div>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="انتخاب دسته‌بندی">
                    {field.value && byId.has(field.value)
                      ? getCategoryPath(field.value, byId)
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {"— ".repeat(node.depth)}
                      {node.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-sm text-destructive">
              {errors.categoryId.message}
            </p>
          )}
          {product && (
            <p className="text-xs text-muted-foreground">
              با تغییر دسته‌بندی، ویژگی‌هایی که دسته جدید ندارد حذف می‌شوند و
              سایز تنوع‌ها باید با جدول سایز دسته جدید سازگار باشد.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-base-price">قیمت پایه (تومان)</Label>
          <Controller
            control={control}
            name="basePrice"
            render={({ field }) => (
              <PriceInput
                id="product-base-price"
                value={field.value || null}
                onChange={(v) => field.onChange(v ?? 0)}
              />
            )}
          />
          {errors.basePrice && (
            <p className="text-sm text-destructive">
              {errors.basePrice.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-sale-price">قیمت حراج (اختیاری)</Label>
          <Controller
            control={control}
            name="salePrice"
            render={({ field }) => (
              <PriceInput
                id="product-sale-price"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.salePrice && (
            <p className="text-sm text-destructive">
              {errors.salePrice.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            قیمت تنوع‌ها به‌صورت پیش‌فرض از همین قیمت‌ها می‌آید و در مرحله ۴
            قابل تغییر است.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product-description">توضیحات</Label>
          <Textarea
            id="product-description"
            rows={6}
            {...register("description")}
          />
        </div>
      </div>

      <StepFooter isSaving={isCreating || isUpdating} />

      <CategoryFormDialog
        open={categoryDialog}
        onOpenChange={setCategoryDialog}
        category={null}
        defaultParentId={null}
        allNodes={allNodes}
        onSaved={(category) =>
          setValue("categoryId", category.id, { shouldValidate: true })
        }
      />
    </form>
  );
}
