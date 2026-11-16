"use client";

import { useEffect, useRef, useState } from "react";

type TabsProps<T extends string> = {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
};

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: TabsProps<T>) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  // The underline slides to the active tab; re-measured on resize and once fonts are ready
  useEffect(() => {
    const measure = () => {
      const el = refs.current[active];
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, tabs]);

  return (
    <div
      role="tablist"
      aria-label="اطلاعات محصول"
      className="relative flex gap-8 border-b border-[#e8e5e1]"
    >
      {tabs.map((t) => (
        <button
          key={t}
          ref={(el) => {
            refs.current[t] = el;
          }}
          type="button"
          role="tab"
          aria-selected={active === t}
          onClick={() => onChange(t)}
          className={`pb-4 pt-1 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:text-[#68578b] ${
            active === t
              ? "text-[#1c1a1f]"
              : "text-[#1c1a1f]/45 hover:text-[#1c1a1f]/75"
          }`}
        >
          {t}
        </button>
      ))}

      {bar && (
        <span
          aria-hidden
          className="absolute -bottom-px h-0.5 rounded-full bg-[#68578b] transition-[left,width] duration-300 ease-out"
          style={{ left: bar.left, width: bar.width }}
        />
      )}
    </div>
  );
}
