import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68578b] focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none";
  const variants = {
    primary:
      "bg-[#68578b] text-white hover:bg-[#544571] active:scale-[0.98] shadow-sm hover:shadow-md",
    outline:
      "border border-[#1c1a1f]/15 text-[#1c1a1f] hover:border-[#1c1a1f]/40 hover:bg-[#faf9f7] active:scale-[0.98]",
    ghost: "text-[#1c1a1f]/70 hover:text-[#1c1a1f] hover:bg-[#faf9f7]",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#eeece8] ${className}`} />
  );
}
