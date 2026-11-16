// components/admin/users/user-table.tsx
"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleBadge } from "./role-badge";
import { BanStatusBadge } from "./ban-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminUsersQuery } from "@/redux/services/adminUserApi";

export function UserTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? undefined;
  const role =
    (searchParams.get("role") as "admin" | "user" | null) ?? undefined;
  const banned =
    (searchParams.get("banned") as "true" | "false" | null) ?? undefined;

  const { data, isLoading, isFetching } = useGetAdminUsersQuery({
    page,
    pageSize: 20,
    search,
    role: role ?? undefined,
    banned: banned ?? undefined,
  });

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#EDE3CC] py-16 text-center text-[#6B5D4F]">
        کاربری یافت نشد
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کاربر</TableHead>
              <TableHead>تماس</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>سفارش‌ها</TableHead>
              <TableHead>عضویت</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((user) => {
              const fullName =
                [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                user.name;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{fullName}</TableCell>
                  <TableCell dir="ltr" className="text-sm text-[#6B5D4F]">
                    <div>{user.email}</div>
                    {user.phoneNumber && <div>{user.phoneNumber}</div>}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <BanStatusBadge
                      banned={user.banned}
                      banExpires={user.banExpires}
                    />
                  </TableCell>
                  <TableCell>{user._count.orders}</TableCell>
                  <TableCell className="text-sm text-[#6B5D4F]">
                    {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/users/${user.id}`}>مشاهده</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B5D4F]">
          {data.meta.total} کاربر — صفحه {data.meta.page} از{" "}
          {data.meta.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            قبلی
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.meta.totalPages}
            onClick={() => goToPage(page + 1)}
          >
            بعدی
          </Button>
        </div>
      </div>
    </div>
  );
}
