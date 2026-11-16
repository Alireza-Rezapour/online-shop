"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { useSaveProductImagesMutation } from "@/redux/services/productApi";
import type { ProductAdminDto } from "@/services/product/product.service";
import { getErrorMessage } from "@/app/(admin)/lib/product/product-utils";
import { StepFooter } from "../step-footer";
import { FileUploadField } from "../../shared/file-upload-field";
import { UploadPurpose } from "@/services/storage/storage.types";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024;

type GalleryItem = { key: number; url: string | null; alt: string };

type Props = {
  product: ProductAdminDto;
  onSaved: (product: ProductAdminDto) => void;
  onBack: () => void;
};

export function StepImages({ product, onSaved, onBack }: Props) {
  const [saveImages, { isLoading: isSaving }] = useSaveProductImagesMutation();

  const keyCounter = useRef(0);
  const [cover, setCover] = useState<string | null>(product.coverImage);
  const [hover, setHover] = useState<string | null>(product.hoverImage);
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    product.images.map((image) => ({
      key: keyCounter.current++,
      url: image.url,
      alt: image.alt,
    })),
  );

  const patchItem = (key: number, change: Partial<GalleryItem>) =>
    setGallery((prev) =>
      prev.map((g) => (g.key === key ? { ...g, ...change } : g)),
    );

  const moveItem = (index: number, direction: -1 | 1) =>
    setGallery((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cover) {
      ErrorToast("تصویر شاخص محصول الزامی است");
      return;
    }

    try {
      const saved = await saveImages({
        id: product.id,
        data: {
          coverImage: cover,
          hoverImage: hover,
          images: gallery
            .filter((g): g is GalleryItem & { url: string } => !!g.url)
            .map((g) => ({ url: g.url, alt: g.alt.trim() || undefined })),
        },
      }).unwrap();
      SuccessToast("تصاویر ذخیره شد");
      onSaved(saved);
    } catch (error) {
      ErrorToast(getErrorMessage(error, "ذخیره تصاویر ناموفق بود"));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <Label>تصویر شاخص (الزامی)</Label>
          <FileUploadField
            purpose={UploadPurpose.PRODUCT_IMAGE}
            label="تصویر شاخص"
            value={cover}
            onChange={setCover}
          />
        </div>

        <div className="space-y-2">
          <Label>تصویر هاور (اختیاری)</Label>
          <FileUploadField
            purpose={UploadPurpose.PRODUCT_IMAGE}
            label="تصویر هاور"
            value={hover}
            onChange={setHover}
          />
          <p className="text-xs text-muted-foreground">
            با رفتن موس روی کارت محصول، این تصویر نمایش داده می‌شود.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            گالری{" "}
            <span className="text-muted-foreground">({gallery.length})</span>
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={gallery.length >= 20}
            onClick={() =>
              setGallery((prev) => [
                ...prev,
                { key: keyCounter.current++, url: null, alt: "" },
              ])
            }
          >
            <Plus className="size-4" />
            افزودن تصویر
          </Button>
        </div>

        {gallery.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            هنوز تصویری به گالری اضافه نشده است.
          </p>
        )}

        <div className="space-y-3">
          {gallery.map((item, index) => (
            <div
              key={item.key}
              className="flex flex-wrap items-start gap-4 rounded-lg border p-3"
            >
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  aria-label="انتقال به بالا"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={index === gallery.length - 1}
                  onClick={() => moveItem(index, 1)}
                  aria-label="انتقال به پایین"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>

              <div className="min-w-60 flex-1">
                <FileUploadField
                  purpose={UploadPurpose.PRODUCT_IMAGE}
                  label="تصویر"
                  value={item.url}
                  onChange={(url) => patchItem(item.key, { url })}
                />
              </div>

              <div className="min-w-48 flex-1 space-y-1.5">
                <Label className="text-xs">متن جایگزین (Alt)</Label>
                <Input
                  value={item.alt}
                  placeholder={product.title}
                  onChange={(e) => patchItem(item.key, { alt: e.target.value })}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-secondary  hover:text-destructive"
                title="حذف از گالری"
                onClick={() =>
                  setGallery((prev) => prev.filter((g) => g.key !== item.key))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <StepFooter onBack={onBack} isSaving={isSaving} />
    </form>
  );
}
