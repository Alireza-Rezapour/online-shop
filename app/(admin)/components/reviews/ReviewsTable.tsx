"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/redux/services/reviewApi";
import { formatDate } from "@/app/(dashboard)/data/utils";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "درانتظار بررسی",
  APPROVED: "تایید شده",
  REJECTED: "رد شده",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> =
  {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
  };

interface ReviewsTableProps {
  reviews: Review[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReviewsTable({
  reviews,
  selectedId,
  onSelect,
}: ReviewsTableProps) {
  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        نظری یافت نشد
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>محصول</TableHead>
          <TableHead>کاربر</TableHead>
          <TableHead>امتیاز</TableHead>
          <TableHead>نظر</TableHead>
          <TableHead>وضعیت</TableHead>
          <TableHead>تاریخ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews.map((review) => (
          <TableRow
            key={review.id}
            onClick={() => onSelect(review.id)}
            data-state={selectedId === review.id ? "selected" : undefined}
            className="cursor-pointer"
          >
            <TableCell>{review.product?.title ?? "-"}</TableCell>
            <TableCell>{review.user?.name ?? "-"}</TableCell>
            <TableCell>{review.rating} / 5</TableCell>
            <TableCell className="max-w-xs truncate">
              {review.comment}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[review.status]}>
                {STATUS_LABEL[review.status]}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(review.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
