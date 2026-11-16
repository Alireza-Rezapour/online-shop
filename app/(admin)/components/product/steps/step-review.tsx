"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ErrorToast from "@/lib/toast/error-toast";
import SuccessToast from "@/lib/toast/success-toast";
import { useSetProductPublishedMutation } from "@/redux/services/productApi";
import type { ProductAdminDto } from "@/services/product/product.service";
import { getErrorMessage } from "@/app/(admin)/lib/product/product-utils";
import { formatPrice } from "@/lib/utils";

type Props = {
  product: ProductAdminDto;
  onSaved: (product: ProductAdminDto) => void;
  onBack: () => void;
};

export function StepReview({ product, onSaved, onBack }: Props) {
  const router = useRouter();
  const [setPublished, { isLoading }] = useSetProductPublishedMutation();

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const required = [
    { ok: !!product.coverImage, label: "تصویر شاخص" },
    { ok: product.variants.length > 0, label: "حداقل یک تنوع (رنگ و سایز)" },
  ];
  const warnings = [
    totalStock === 0 && product.variants.length > 0
      ? "موجودی همه تنوع‌ها صفر است"
      : null,
    product.attributes.length === 0 ? "هیچ ویژگی‌ای ثبت نشده است" : null,
    product.images.length === 0 ? "گالری تصاویر خالی است" : null,
  ].filter(Boolean) as string[];

  const canPublish = required.every((r) => r.ok);

  const toggle = async () => {
    try {
      const saved = await setPublished({
        id: product.id,
        isPublished: !product.isPublished,
      }).unwrap();
      onSaved(saved);
      SuccessToast(
        saved.isPublished ? "محصول منتشر شد" : "انتشار محصول لغو شد",
      );
      if (saved.isPublished) router.push("/admin/product");
    } catch (error) {
      ErrorToast(getErrorMessage(error, "تغییر وضعیت انتشار ناموفق بود"));
    }
  };

  return (
    <div className="space-y-6">
      <dl className="grid gap-4 rounded-lg border p-4 text-sm sm:grid-cols-2">
        <Item label="عنوان" value={product.title} />
        <Item label="دسته‌بندی" value={product.category.name} />
        <Item
          label="قیمت پایه"
          value={`${formatPrice(product.basePrice)} تومان`}
        />
        <Item
          label="قیمت حراج"
          value={
            product.salePrice
              ? `${formatPrice(product.salePrice)} تومان`
              : "ندارد"
          }
        />
        <Item label="ویژگی‌ها" value={`${product.attributes.length} مورد`} />
        <Item
          label="تنوع‌ها"
          value={`${product.variants.length} تنوع · ${formatPrice(totalStock)} موجودی کل`}
        />
        <Item label="تصاویر گالری" value={`${product.images.length} تصویر`} />
        <Item
          label="وضعیت"
          value={product.isPublished ? "منتشر شده" : "پیش‌نویس"}
        />
      </dl>

      <div className="space-y-2">
        {required.map((item) => (
          <p key={item.label} className="flex items-center gap-2 text-sm">
            {item.ok ? (
              <CheckCircle2 className="size-4 text-green-600" />
            ) : (
              <Circle className="size-4 text-destructive" />
            )}
            {item.label}
          </p>
        ))}
        {warnings.map((warning) => (
          <p
            key={warning}
            className="flex items-center gap-2 text-sm text-amber-600"
          >
            <AlertTriangle className="size-4" />
            {warning}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          مرحله قبل
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/product")}
            disabled={isLoading}
          >
            خروج
          </Button>
          <Button
            type="button"
            onClick={toggle}
            disabled={isLoading || !canPublish}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {product.isPublished ? "لغو انتشار" : "انتشار محصول"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
