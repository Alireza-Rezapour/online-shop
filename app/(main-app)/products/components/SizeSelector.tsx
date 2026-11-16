export type SizeOption = {
  id: string;
  name: string;
  /** stock of this size in the currently selected color (0 = sold out / doesn't exist) */
  availableStock: number;
};

type SizeSelectorProps = {
  sizes: SizeOption[];
  selected?: string;
  onSelect: (sizeId: string) => void;
  /** true after the shopper tried to add to cart without choosing a size */
  invalid?: boolean;
  /** when given, a "size guide" link is shown */
  onOpenGuide?: () => void;
};

export default function SizeSelector({
  sizes,
  selected,
  onSelect,
  invalid = false,
  onOpenGuide,
}: SizeSelectorProps) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span
          className={`text-base font-semibold transition-colors duration-200 ${
            invalid ? "text-red-600" : "text-[#1c1a1f]/70"
          }`}
        >
          اندازه
        </span>
        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-sm text-[#68578b] underline underline-offset-4 hover:text-[#544571]"
          >
            راهنمای اندازه
          </button>
        )}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="انتخاب اندازه"
        aria-invalid={invalid}
      >
        {sizes.map((s) => {
          const isSelected = selected === s.id;
          const soldOut = s.availableStock <= 0;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={soldOut ? `${s.name} (ناموجود)` : s.name}
              disabled={soldOut}
              onClick={() => onSelect(s.id)}
              className={`h-11 min-w-14 rounded-full border px-4 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-[#68578b] bg-[#68578b] text-white shadow-sm"
                  : soldOut
                    ? "cursor-not-allowed border-dashed border-[#1c1a1f]/15 text-[#1c1a1f]/30 line-through"
                    : `${
                        invalid ? "border-red-300" : "border-[#1c1a1f]/15"
                      } text-[#1c1a1f] hover:border-[#68578b] hover:text-[#68578b] active:scale-95`
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {invalid && (
        <p
          role="alert"
          className="mt-2 text-sm text-red-600 transition duration-200 starting:-translate-y-1 starting:opacity-0"
        >
          برای ادامه، یک اندازه انتخاب کنید.
        </p>
      )}
    </div>
  );
}
