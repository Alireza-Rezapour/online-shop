"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileDrawer({ open, onClose, children }: DrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e8e5e1] px-5 py-4">
          <h2 className="text-base font-semibold text-[#1c1a1f]">فیلتر ها</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#1c1a1f]/60 transition-colors duration-150 hover:bg-[#faf9f7] hover:text-[#1c1a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-[calc(100%-64px)] overflow-y-auto px-5 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
