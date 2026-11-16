// components/admin/users/tabs/reviews-tab.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminReviewsQuery } from "@/redux/services/reviewApi";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  APPROVED: "تایید شده",
  REJECTED: "رد شده",
};

const LIMIT = 10;

export function ReviewsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminReviewsQuery({
    userId,
    page,
    limit: LIMIT,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!data || data.reviews.length === 0)
    return (
      <p className="py-10 text-center text-sm text-[#6B5D4F]">
        نظری ثبت نشده است
      </p>
    );

  const totalPages = Math.max(1, Math.ceil(data.total / LIMIT));

  return (
    <div className="space-y-4">
      {data.reviews.map((r) => (
        <div
          key={r.id}
          className="space-y-2 rounded-lg border border-[#EDE3CC] p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#2A2018]">
              {r.product?.title}
            </p>
            <span className="text-xs text-[#6B5D4F]">
              {"★".repeat(r.rating)} · {STATUS_LABEL[r.status] ?? r.status}
            </span>
          </div>
          {r.title && (
            <p className="text-sm font-medium text-[#2A2018]">{r.title}</p>
          )}
          <p className="text-sm text-[#2A2018]">{r.comment}</p>
          {r.adminReply && (
            <div className="rounded-md bg-[#FBF6EA] p-3 text-sm text-[#6B5D4F]">
              پاسخ ادمین: {r.adminReply}
            </div>
          )}
          <p className="text-xs text-[#6B5D4F]">
            {new Date(r.createdAt).toLocaleDateString("fa-IR")}
          </p>
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          بعدی
        </Button>
      </div>
    </div>
  );
}
