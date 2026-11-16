"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCouponsQuery } from "@/redux/services/couponApi";
import type { CouponDto, CouponType } from "@/services/coupon/coupon.schema";
import { PageHeader } from "../../components/AdminShell";
import { AdminPagination } from "../../components/shared/admin-paginaton";
import { CouponTable } from "../../components/coupon/coupon-table";
import { CouponFormDialog } from "../../components/coupon/coupon-form-dialog";

const PAGE_SIZE = 20;

type TypeFilter = "ALL" | CouponType;
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "همه انواع" },
  { value: "PERCENTAGE", label: "درصدی" },
  { value: "FIXED", label: "مبلغ ثابت" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "همه وضعیت‌ها" },
  { value: "ACTIVE", label: "فعال" },
  { value: "INACTIVE", label: "غیرفعال" },
];

export default function AdminCouponsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CouponDto | null>(null);

  // Wait for the admin to stop typing before hitting the API
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, isError, refetch } = useGetCouponsQuery({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(typeFilter !== "ALL" && { type: typeFilter }),
    ...(statusFilter !== "ALL" && { isActive: statusFilter === "ACTIVE" }),
    page,
    pageSize: PAGE_SIZE,
  });

  const coupons = data?.items ?? [];

  // e.g. the last coupon of the last page was deleted
  useEffect(() => {
    if (data && page > data.totalPages) setPage(data.totalPages);
  }, [data, page]);

  return (
    <>
      <PageHeader
        breadcrumb={[{ href: "/admin/coupons", label: "کدهای تخفیف" }]}
      />
      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">کدهای تخفیف</h1>
            <p className="text-sm text-muted-foreground">
              ساخت و مدیریت کدهای تخفیف و محدودیت‌های استفاده
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            کد تخفیف جدید
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی کد تخفیف..."
              className="pr-9"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as TypeFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">بارگذاری کدهای تخفیف</p>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border p-10 text-sm">
            <p className="text-muted-foreground">
              دریافت کدهای تخفیف ناموفق بود.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              تلاش مجدد
            </Button>
          </div>
        ) : (
          <>
            <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
              <CouponTable coupons={coupons} onEdit={setEditTarget} />
            </div>

            <AdminPagination
              itemLabel="کد تخفیف"
              page={page}
              totalPages={data?.totalPages ?? 1}
              total={data?.total ?? 0}
              pageSize={PAGE_SIZE}
              disabled={isFetching}
              onPageChange={setPage}
            />
          </>
        )}

        <CouponFormDialog open={createOpen} onOpenChange={setCreateOpen} />

        <CouponFormDialog
          open={!!editTarget}
          coupon={editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
        />
      </div>
    </>
  );
}
