"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onBack?: () => void;
  isSaving?: boolean;
  disabled?: boolean;
  nextLabel?: string;
};

export function StepFooter({
  onBack,
  isSaving,
  disabled,
  nextLabel = "ذخیره و ادامه",
}: Props) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
      {onBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSaving}
        >
          مرحله قبل
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" disabled={isSaving || disabled}>
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        {nextLabel}
      </Button>
    </div>
  );
}
