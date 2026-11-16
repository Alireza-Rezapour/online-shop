import { PackageSearch } from "lucide-react";
import { Button } from "./ui";

export default function EmptyState({
  onClear,
  message,
}: {
  onClear?: () => void;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e5e1] px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#faf9f7]">
        <PackageSearch size={24} className="text-[#68578b]" />
      </div>
      <h3 className="mt-5 text-lg font-medium text-[#1c1a1f]">
        هیچ محصولی پیدا نشد
      </h3>
      {message && <p className="mt-2 text-sm text-[#1c1a1f]/55">{message}</p>}

      {onClear && (
        <Button
          variant="primary"
          onClick={onClear}
          className="mt-6 px-6 py-2.5"
        >
          پاک کردن فیلتر ها
        </Button>
      )}
    </div>
  );
}
