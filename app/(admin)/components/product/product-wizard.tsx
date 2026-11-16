"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProductAdminQuery } from "@/redux/services/productApi";
import type { ProductAdminDto } from "@/services/product/product.service";
import { PageHeader } from "../AdminShell";
import { StepBasic } from "./steps/step-basic";
import { StepAttributes } from "./steps/step-attributes";
import { StepVariants } from "./steps/step-variants";
import { StepStock } from "./steps/step-stock";
import { StepImages } from "./steps/step-image";
import { StepReview } from "./steps/step-review";

const STEPS = [
  { id: 1, title: "اطلاعات پایه" },
  { id: 2, title: "ویژگی‌ها" },
  { id: 3, title: "رنگ و سایز" },
  { id: 4, title: "موجودی و قیمت" },
  { id: 5, title: "تصاویر" },
  { id: 6, title: "بازبینی و انتشار" },
] as const;

type Props = { productId?: string; initialStep?: number };

export function ProductWizard({ productId, initialStep = 1 }: Props) {
  const router = useRouter();

  const { data, isFetching, isError, refetch } = useGetProductAdminQuery(
    productId ?? "",
    { skip: !productId, refetchOnMountOrArgChange: true },
  );

  // The wizard owns the product once loaded; every save returns the fresh product
  const [product, setProduct] = useState<ProductAdminDto | null>(null);
  const [step, setStep] = useState(() =>
    productId ? Math.min(Math.max(initialStep, 1), STEPS.length) : 1,
  );

  useEffect(() => {
    if (data && !isFetching && !product) setProduct(data);
  }, [data, isFetching, product]);

  const goTo = (target: number) => {
    if (target > 1 && !product) return;
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaved = (saved: ProductAdminDto, nextStep: number) => {
    setProduct(saved);
    if (!productId) {
      // First save created the draft: move to its edit URL, the wizard reloads there
      router.replace(`/admin/product/${saved.id}/edit?step=${nextStep}`);
      return;
    }
    goTo(nextStep);
  };

  const loading = !!productId && !product && !isError;

  return (
    <div className="p-8">
      <PageHeader
        breadcrumb={[
          { href: "/admin", label: "داشبورد" },
          { href: "/admin/product", label: "محصولات" },
        ]}
      />

      {/* Stepper */}
      <ol className="mb-8 mt-6 flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const done = !!product && s.id < step;
          const locked = s.id > 1 && !product;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => goTo(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                  s.id === step && "border-primary bg-primary/10 font-medium",
                  s.id !== step && !locked && "hover:bg-muted",
                  locked && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-xs",
                    done && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {done ? <Check className="size-3" /> : s.id}
                </span>
                {s.title}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-lg border bg-card p-4 sm:p-6">
        {loading && (
          <div className="h-64 animate-pulse rounded-lg bg-muted/60" />
        )}

        {isError && !product && (
          <div className="flex flex-col items-center gap-3 p-10 text-sm">
            <p className="text-muted-foreground">
              دریافت اطلاعات محصول ناموفق بود.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              تلاش مجدد
            </Button>
          </div>
        )}

        {!loading && !(isError && !product) && (
          <>
            {step === 1 && (
              <StepBasic product={product} onSaved={(p) => handleSaved(p, 2)} />
            )}

            {step === 2 && product && (
              <StepAttributes
                product={product}
                onSaved={(p) => handleSaved(p, 3)}
                onBack={() => goTo(1)}
              />
            )}

            {step === 3 && product && (
              <StepVariants
                product={product}
                onSaved={(p) => handleSaved(p, 4)}
                onBack={() => goTo(2)}
              />
            )}

            {step === 4 && product && (
              <StepStock
                product={product}
                onSaved={(p) => handleSaved(p, 5)}
                onBack={() => goTo(3)}
                goToVariants={() => goTo(3)}
              />
            )}

            {step === 5 && product && (
              <StepImages
                product={product}
                onSaved={(p) => handleSaved(p, 6)}
                onBack={() => goTo(4)}
              />
            )}

            {step === 6 && product && (
              <StepReview
                product={product}
                onSaved={(p) => setProduct(p)}
                onBack={() => goTo(5)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
