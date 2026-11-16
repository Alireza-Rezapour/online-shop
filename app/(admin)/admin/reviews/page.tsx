"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAdminReviewsQuery } from "@/redux/services/reviewApi";
import type { ReviewStatus } from "@/lib/generated/prisma/enums";

import { PageHeader } from "../../components/AdminShell";
import { ReviewsTable } from "../../components/reviews/ReviewsTable";
import { ReviewDetails } from "../../components/reviews/ReviewsDeatails";
import { AdminPagination } from "../../components/shared/admin-paginaton";

type StatusFilter = "ALL" | ReviewStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "همه" },
  { value: "PENDING", label: "درانتظار بررسی" },
  { value: "APPROVED", label: "تایید شده" },
  { value: "REJECTED", label: "رد شده" },
];

const PAGE_SIZE = 10;

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetAdminReviewsQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  // Deleting the last review on the last page leaves an empty page: step back
  useEffect(() => {
    if (data && page > totalPages) setPage(totalPages);
  }, [data, page, totalPages]);

  return (
    <>
      <PageHeader breadcrumb={[{ href: "/reviews", label: "نظرات" }]} />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">نظرات</h1>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">در حال بارگذاری نظرات</p>
        ) : (
          <>
            <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
              <ReviewsTable
                reviews={data?.reviews ?? []}
                selectedId={selectedReviewId}
                onSelect={setSelectedReviewId}
              />
            </div>

            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={data?.total ?? 0}
              pageSize={PAGE_SIZE}
              itemLabel="نظر"
              disabled={isFetching}
              onPageChange={(p) => {
                setPage(p);
                setSelectedReviewId(null);
              }}
            />
          </>
        )}

        <ReviewDetails
          reviewId={selectedReviewId}
          open={!!selectedReviewId}
          onOpenChange={(open) => !open && setSelectedReviewId(null)}
        />
      </div>
    </>
  );
}
