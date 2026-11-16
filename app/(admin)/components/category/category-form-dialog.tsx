"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/redux/services/categoryApi";
import { useGetSizeChartsQuery } from "@/redux/services/sizeChartApi";
import { useGetAttributesQuery } from "@/redux/services/attributeApi";
import {
  CategoryNode,
  collectDescendantIds,
  getCategoryPath,
  getErrorMessage,
} from "../../lib/category/category-utils";
import SuccessToast from "@/lib/toast/success-toast";
import ErrorToast from "@/lib/toast/error-toast";
import { slugify } from "../shared/slugify";
import { CategoryDto } from "@/services/category/category.service";
import { FileUploadField } from "../shared/file-upload-field";
import { UploadPurpose } from "@/services/storage/storage.types";

const NONE = "none";
const slugRegex = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/;

const formSchema = z.object({
  name: z.string().trim().min(1, "نام دسته‌بندی الزامی است").max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "اسلاگ الزامی است")
    .max(120)
    .regex(slugRegex, "اسلاگ فقط می‌تواند شامل حروف، عدد و خط تیره باشد"),
  parentId: z.string().nullable(),
  image: z.string().trim(),
  sizeChartId: z.string().nullable(),
  attributeIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryNode | null;
  defaultParentId: string | null;
  allNodes: CategoryNode[];
  onSaved?: (category: CategoryDto) => void;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultParentId,
  allNodes,
  onSaved,
}: Props) {
  const isEdit = !!category;
  const [slugTouched, setSlugTouched] = useState(false);

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const isSaving = isCreating || isUpdating;

  const { data: sizeCharts = [] } = useGetSizeChartsQuery(undefined, {
    skip: !open,
  });
  const { data: attributes = [] } = useGetAttributesQuery(undefined, {
    skip: !open,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      image: "",
      sizeChartId: null,
      attributeIds: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    setSlugTouched(!!category);
    reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      parentId: category ? category.parentId : defaultParentId,
      image: category?.image ?? "",
      sizeChartId: category?.sizeChartId ?? null,
      attributeIds: category?.attributes.map((a) => a.id) ?? [],
    });
  }, [open, category, defaultParentId, reset]);

  const byId = useMemo(
    () => new Map(allNodes.map((n) => [n.id, n])),
    [allNodes],
  );

  // A category can never be its own parent or sit under one of its descendants
  const parentOptions = useMemo(() => {
    if (!category) return allNodes;
    const blocked = new Set([category.id, ...collectDescendantIds(category)]);
    return allNodes.filter((n) => !blocked.has(n.id));
  }, [allNodes, category]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      parentId: values.parentId,
      image: values.image || null,
      sizeChartId: values.sizeChartId,
      attributeIds: values.attributeIds,
    };

    try {
      const saved = category
        ? await updateCategory({ id: category.id, data: payload }).unwrap()
        : await createCategory(payload).unwrap();
      SuccessToast(
        category
          ? "دسته‌بندی با موفقیت ویرایش شد"
          : "دسته‌بندی با موفقیت ایجاد شد",
      );
      onOpenChange(false);
      onSaved?.(saved);

      onOpenChange(false);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره دسته‌بندی ناموفق بود"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "اطلاعات دسته‌بندی را ویرایش کنید."
              : "اطلاعات دسته‌بندی جدید را وارد کنید."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="category-name">نام</Label>
            <Input
              id="category-name"
              {...register("name", {
                onChange: (e) => {
                  if (!isEdit && !slugTouched) {
                    setValue("slug", slugify(e.target.value));
                  }
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-slug">اسلاگ</Label>
            <Input
              id="category-slug"
              dir="ltr"
              {...register("slug", { onChange: () => setSlugTouched(true) })}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>دسته‌بندی والد</Label>
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                <Select
                  value={field.value ?? NONE}
                  onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {field.value
                        ? getCategoryPath(field.value, byId)
                        : "بدون والد (دسته اصلی)"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>بدون والد (دسته اصلی)</SelectItem>
                    {parentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {"— ".repeat(option.depth)}
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                خود دسته‌بندی و زیرمجموعه‌های آن در این لیست نمایش داده
                نمی‌شوند.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>تصویر</Label>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <FileUploadField
                  purpose={UploadPurpose.CATEGORY_IMAGE}
                  label="تصویر"
                  value={field.value || null}
                  onChange={(key) => field.onChange(key ?? "")}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>جدول سایز</Label>
            <Controller
              control={control}
              name="sizeChartId"
              render={({ field }) => (
                <Select
                  value={field.value ?? NONE}
                  onValueChange={(v) => field.onChange(v === NONE ? null : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="بدون جدول سایز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>بدون جدول سایز</SelectItem>
                    {sizeCharts.map((chart) => (
                      <SelectItem key={chart.id} value={chart.id}>
                        {chart.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>ویژگی‌ها</Label>
            <Controller
              control={control}
              name="attributeIds"
              render={({ field }) => (
                <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border p-2">
                  {attributes.length === 0 && (
                    <p className="p-2 text-sm text-muted-foreground">
                      ویژگی‌ای تعریف نشده است.
                    </p>
                  )}
                  {attributes.map((attribute) => {
                    const checked = field.value.includes(attribute.id);
                    return (
                      <label
                        key={attribute.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) =>
                            field.onChange(
                              next
                                ? [...field.value, attribute.id]
                                : field.value.filter(
                                    (id) => id !== attribute.id,
                                  ),
                            )
                          }
                        />
                        {attribute.name}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "ذخیره تغییرات" : "ایجاد دسته‌بندی"}
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
