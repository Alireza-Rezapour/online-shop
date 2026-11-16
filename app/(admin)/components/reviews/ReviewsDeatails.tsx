"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAdminReviewQuery,
  useUpdateReviewStatusMutation,
  useReplyToReviewMutation,
  useDeleteReviewMutation,
} from "@/redux/services/reviewApi";
import { formatDate } from "@/app/(dashboard)/data/utils";

interface ReviewDetailsProps {
  reviewId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDetails({
  reviewId,
  open,
  onOpenChange,
}: ReviewDetailsProps) {
  const { data: review } = useGetAdminReviewQuery(
    { id: reviewId ?? "" },
    { skip: !reviewId },
  );

  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReply(review?.adminReply ?? "");
    setError(null);
  }, [review?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [updateStatus, { isLoading: statusLoading }] =
    useUpdateReviewStatusMutation();
  const [replyToReview, { isLoading: replyLoading }] =
    useReplyToReviewMutation();
  const [deleteReview, { isLoading: deleteLoading }] =
    useDeleteReviewMutation();

  if (!review) return null;

  const handleStatus = async (status: "APPROVED" | "REJECTED") => {
    setError(null);
    try {
      await updateStatus({ id: review.id, status }).unwrap();
    } catch (err) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ??
          "خطا در بروزرسانی وضعیت",
      );
    }
  };

  const handleReply = async () => {
    setError(null);
    try {
      await replyToReview({ id: review.id, adminReply: reply }).unwrap();
    } catch (err) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ??
          "خطا در ثبت پاسخ",
      );
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteReview({ id: review.id }).unwrap();
      onOpenChange(false);
    } catch (err) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ??
          "خطا در حذف نظر",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>جزئیات نظر</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>{review.product?.title}</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">{review.user?.name}</span>
            <span>{review.rating} / 5</span>
          </div>
          {review.title && <p className="font-medium">{review.title}</p>}
          <p className="leading-relaxed">{review.comment}</p>
          {review.isVerifiedPurchase && (
            <p className="text-xs text-muted-foreground">خرید تایید شده</p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            disabled={statusLoading || review.status === "APPROVED"}
            onClick={() => handleStatus("APPROVED")}
          >
            تایید
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={statusLoading || review.status === "REJECTED"}
            onClick={() => handleStatus("REJECTED")}
          >
            رد
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={deleteLoading}
            onClick={handleDelete}
            className="mr-auto"
          >
            حذف
          </Button>
        </div>

        <div className="space-y-2 border-t pt-3">
          <label className="text-xs font-medium text-muted-foreground">
            پاسخ فروشگاه
          </label>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="پاسخ خود را بنویسید..."
          />
          <Button size="sm" disabled={replyLoading} onClick={handleReply}>
            ثبت پاسخ
          </Button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
