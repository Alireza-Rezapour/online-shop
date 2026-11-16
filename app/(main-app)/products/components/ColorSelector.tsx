export type ColorOption = {
  id: string;
  name: string;
  hex: string;
  /** false when every variant of this color is sold out */
  inStock: boolean;
};

type ColorSelectorProps = {
  colors: ColorOption[];
  selected?: string;
  onSelect: (colorId: string) => void;
};

export default function ColorSelector({
  colors,
  selected,
  onSelect,
}: ColorSelectorProps) {
  const current = colors.find((c) => c.id === selected);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-base font-semibold text-[#1c1a1f]/70">رنگ</span>
        <span
          key={current?.id}
          className="text-sm text-[#1c1a1f] transition duration-200 starting:translate-x-1 starting:opacity-0"
        >
          {current?.name}
        </span>
      </div>

      <div
        className="flex flex-wrap gap-3"
        role="radiogroup"
        aria-label="انتخاب رنگ"
      >
        {colors.map((color) => {
          const isSelected = selected === color.id;
          const label = color.inStock ? color.name : `${color.name} (ناموجود)`;
          return (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              title={label}
              disabled={!color.inStock}
              onClick={() => onSelect(color.id)}
              className={`relative h-10 w-10 rounded-full p-1 outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 ${
                isSelected
                  ? "scale-105 ring-2 ring-[#68578b] ring-offset-2"
                  : "ring-1 ring-transparent hover:ring-[#1c1a1f]/25 hover:ring-offset-2"
              }`}
            >
              <span
                className="relative block h-full w-full overflow-hidden rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: color.hex }}
              >
                {!color.inStock && (
                  <span className="absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#1c1a1f]/60" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
