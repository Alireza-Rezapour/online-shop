// components/admin/users/user-filters.tsx
"use client";

import { useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  function handleSearchChange(value: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(
      () => setParam("search", value || undefined),
      400,
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="جستجو بر اساس نام، ایمیل یا شماره تماس"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="sm:max-w-xs"
      />

      <Select
        defaultValue={searchParams.get("role") ?? "all"}
        onValueChange={(v) => setParam("role", v)}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="نقش" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه نقش‌ها</SelectItem>
          <SelectItem value="user">کاربر</SelectItem>
          <SelectItem value="admin">ادمین</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("banned") ?? "all"}
        onValueChange={(v) => setParam("banned", v)}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="وضعیت" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه وضعیت‌ها</SelectItem>
          <SelectItem value="false">فعال</SelectItem>
          <SelectItem value="true">مسدود</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
