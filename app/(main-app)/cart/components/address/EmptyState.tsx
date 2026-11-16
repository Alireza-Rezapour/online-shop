import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddAddress: () => void;
}

export function EmptyState({ onAddAddress }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#68578b]/8">
        <MapPin className="h-6 w-6 text-[#68578b]" />
      </div>
      <h3 className="mt-5 text-lg text-gray-900">هیچ آدرسی ذخیره نشده است</h3>
      <p className="mt-1.5 max-w-xs text-sm text-gray-500">
        برای ادامه یک آدرس اضافه کنید
      </p>
      <Button
        onClick={onAddAddress}
        className="mt-6 gap-1.5 bg-[#68578b] text-white transition-colors duration-150 hover:bg-[#564874]"
      >
        <Plus className="h-4 w-4" />
        اضافه کردن آدرس
      </Button>
    </div>
  );
}
