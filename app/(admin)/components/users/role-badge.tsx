import { cn } from "@/lib/utils";

export function RoleBadge({ role }: { role: string | null }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isAdmin
          ? "bg-[#B4863E]/15 text-[#B4863E]"
          : "bg-[#EDE3CC] text-[#6B5D4F]",
      )}
    >
      {isAdmin ? "ادمین" : "کاربر"}
    </span>
  );
}
