"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SortOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
  label: string;
};

export default function Select({
  value,
  options,
  onChange,
  label,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-full border border-[#1c1a1f]/15 bg-white px-4 text-sm font-medium text-[#1c1a1f] transition-colors duration-200 hover:border-[#1c1a1f]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2"
      >
        {selected?.label}
        <ChevronDown
          size={15}
          className={`text-[#1c1a1f]/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-[#e8e5e1] bg-white py-1.5 shadow-lg animate-in fade-in slide-in-from-top-1"
        >
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-[#faf9f7] ${
                  o.value === value
                    ? "text-[#68578b] font-medium"
                    : "text-[#1c1a1f]/75"
                }`}
              >
                {o.label}
                {o.value === value && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
