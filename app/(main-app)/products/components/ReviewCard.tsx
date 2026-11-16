import Stars from "./Stars";
import { BadgeCheck } from "lucide-react";
import type { Review } from "@/redux/services/reviewApi";

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#1c1a1f]">
              {review.user?.name ?? "کاربر"}
            </span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-xs text-[#68578b]">
                <BadgeCheck size={13} />
                خرید تایید شده
              </span>
            )}
          </div>
          <Stars rating={review.rating} size={14} />
        </div>
        <span className="shrink-0 text-xs text-[#1c1a1f]/45">
          {formatReviewDate(review.createdAt)}
        </span>
      </div>

      {review.title && (
        <h4 className="mt-3 text-sm font-medium text-[#1c1a1f]">
          {review.title}
        </h4>
      )}

      <p className="mt-2 text-[15px] leading-relaxed text-[#1c1a1f]/75">
        {review.comment}
      </p>

      {review.adminReply && (
        <div className="mt-4 rounded-lg border border-[#e8e5e1] bg-[#faf9f7] px-4 py-3">
          <p className="text-xs font-medium text-[#68578b]">پاسخ فروشگاه</p>
          <p className="mt-1 text-sm leading-relaxed text-[#1c1a1f]/70">
            {review.adminReply}
          </p>
        </div>
      )}
    </div>
  );
}
