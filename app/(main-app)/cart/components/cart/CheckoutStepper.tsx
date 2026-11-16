"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutStep } from "../../types/types";

interface Step {
  id: CheckoutStep;
  label: string;
}

const STEPS: Step[] = [
  { id: "cart", label: "سبد خرید" },
  { id: "address", label: "آدرس" },
  { id: "payment", label: "پرداخت" },
];

export function CheckoutStepper({
  setStep,
  currentStepId,
}: {
  currentStepId: string;
  setStep: (step: string) => void;
}) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStepId);
  const progressPercent =
    currentIndex === 0 ? 0 : (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="relative flex items-start justify-between">
        {/* base track */}
        <div
          className="absolute left-0 right-0 top-4 h-px bg-neutral-200 sm:top-5"
          aria-hidden="true"
        />
        {/* animated fill track */}
        <div
          className="absolute left-0 top-4 h-px bg-[#68578b] transition-all duration-500 ease-out sm:top-5"
          style={{ width: `${progressPercent}%` }}
          aria-hidden="true"
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.id}
              className="relative flex flex-col items-center gap-2"
              style={{
                flex:
                  index === 0 || index === STEPS.length - 1
                    ? "0 0 auto"
                    : "1 1 0%",
              }}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-all duration-200 sm:h-10 sm:w-10 sm:text-sm",
                  isCompleted && "border-[#68578b] bg-[#68578b] text-white",
                  isCurrent &&
                    "border-[#68578b] bg-white text-[#68578b] ring-4 ring-[#68578b]/10",
                  !isCompleted &&
                    !isCurrent &&
                    "border-neutral-200 bg-white text-neutral-400",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "max-w-18 text-center text-[11px] font-medium uppercase tracking-wide transition-colors duration-200 sm:max-w-none sm:text-xs sm:tracking-widest",
                  isCurrent && "text-[#68578b]",
                  isCompleted && "text-neutral-700",
                  !isCompleted && !isCurrent && "text-neutral-400",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
