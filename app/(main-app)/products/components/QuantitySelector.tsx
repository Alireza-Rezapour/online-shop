import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  /** most the shopper can still add (stock, per-item limit and what is already in the cart) */
  maxQuantity?: number;
  disabled?: boolean;
}

const faNum = (n: number) => n.toLocaleString("fa-IR");

const stepBtn =
  "flex h-11 w-11 items-center justify-center rounded-full text-[#1c1a1f] transition duration-150 hover:bg-[#f3f1ee] active:scale-90 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b]";

export default function QuantitySelector({
  quantity,
  onChange,
  maxQuantity,
  disabled = false,
}: QuantitySelectorProps) {
  const atMax = maxQuantity !== undefined && quantity >= maxQuantity;

  return (
    <div>
      <span className="mb-3 block text-base font-semibold text-[#1c1a1f]/70">
        تعداد
      </span>
      <div
        className={`inline-flex items-center rounded-full border border-[#1c1a1f]/15 transition-opacity ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <button
          type="button"
          aria-label="کاهش تعداد"
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={disabled || quantity <= 1}
          className={stepBtn}
        >
          <Minus size={15} />
        </button>
        <span
          key={quantity}
          aria-live="polite"
          className="inline-block w-10 text-center text-sm font-semibold tabular-nums transition duration-200 starting:scale-125 starting:opacity-50"
        >
          {faNum(quantity)}
        </span>
        <button
          type="button"
          aria-label="افزایش تعداد"
          onClick={() =>
            onChange(
              maxQuantity !== undefined
                ? Math.min(maxQuantity, quantity + 1)
                : quantity + 1,
            )
          }
          disabled={disabled || atMax}
          className={stepBtn}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
