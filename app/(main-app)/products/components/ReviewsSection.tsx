"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Stars from "./Stars";
import ReviewCard from "./ReviewCard";
import WriteReviewForm from "./WriteReviewForm";

import { authClient } from "@/lib/auth-client";
import {
  useGetProductReviewsQuery,
  useGetReviewEligibilityQuery,
} from "@/redux/services/reviewApi";
import type { Review } from "@/redux/services/reviewApi";

const PAGE_SIZE = 5;

const faNum = (n: number, digits = 0) =>
  n.toLocaleString("fa-IR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  const { data: session, isPending: sessionPending } = authClient.useSession();

  // data        -> last known result: keeps the summary (average, bars) steady while "load more" runs
  // currentData -> only the result of the current page: used to build the list
  const { data, currentData, isLoading, isFetching, isError, refetch } =
    useGetProductReviewsQuery({ productId, page, limit: PAGE_SIZE });

  const { data: eligibility, isLoading: eligibilityLoading } =
    useGetReviewEligibilityQuery({ productId }, { skip: !session?.user });

  // Merge by id: loading more, or a refetch after a change, never duplicates a review
  useEffect(() => {
    if (!currentData) return;
    setReviews((prev) => {
      const merged = new Map(
        (currentData.page === 1 ? [] : prev).map((r) => [r.id, r]),
      );
      for (const r of currentData.reviews) merged.set(r.id, r);
      return [...merged.values()];
    });
  }, [currentData]);

  const total = data?.total ?? 0;
  const averageRating = data?.averageRating ?? 0;
  const hasMore = reviews.length < total;

  const renderAction = () => {
    if (sessionPending) return null;

    if (!session?.user) {
      return (
        <p className="text-sm text-[#1c1a1f]/55">
          برای ثبت نظر ابتدا{" "}
          <Link href="/login" className="text-[#68578b] underline">
            وارد شوید
          </Link>
          .
        </p>
      );
    }

    if (eligibilityLoading) {
      return <p className="text-sm text-[#1c1a1f]/55">در حال بررسی...</p>;
    }
    if (!eligibility) return null;

    if (eligibility.alreadyReviewed) {
      return (
        <p className="text-sm text-[#1c1a1f]/55">
          شما قبلاً برای این محصول نظر ثبت کرده‌اید. نظر شما پس از تایید نمایش
          داده می‌شود.
        </p>
      );
    }

    if (!eligibility.canReview) {
      return (
        <p className="text-sm text-[#1c1a1f]/55">
          برای ثبت نظر باید این محصول را خریداری کرده باشید.
        </p>
      );
    }

    return formOpen ? (
      <WriteReviewForm
        productId={productId}
        onSubmitted={() => setFormOpen(false)}
        onCancel={() => setFormOpen(false)}
      />
    ) : (
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="text-sm font-medium text-[#68578b] underline underline-offset-4"
      >
        ثبت نظر
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Summary */}
      <div>
        <div className="text-5xl font-semibold tabular-nums">
          {total > 0 ? faNum(averageRating, 1) : "–"}
        </div>
        <div className="mt-2">
          <Stars rating={total > 0 ? averageRating : 0} size={16} />
        </div>
        <p className="mt-1 text-sm text-[#1c1a1f]/55">
          بر اساس {faNum(total)} نظر
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count =
              data?.ratingDistribution.find((d) => d.rating === star)?.count ??
              0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={star}
                className="flex items-center gap-3 text-xs text-[#1c1a1f]/60"
              >
                <span className="w-14 shrink-0">{faNum(star)} ستاره</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8e5e1]">
                  <div
                    className="h-full rounded-full bg-[#68578b] transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-left tabular-nums">
                  {faNum(pct)}٪
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8">{renderAction()}</div>
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        {isLoading ? (
          <p className="py-6 text-sm text-[#1c1a1f]/55">
            در حال بارگذاری نظرات...
          </p>
        ) : isError && reviews.length === 0 ? (
          <div className="py-6 text-sm text-[#1c1a1f]/55">
            بارگذاری نظرات انجام نشد.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="text-[#68578b] underline underline-offset-4"
            >
              تلاش دوباره
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <p className="py-6 text-sm text-[#1c1a1f]/55">
            هنوز نظری برای این محصول ثبت نشده است.
          </p>
        ) : (
          <div className="divide-y divide-[#e8e5e1]">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {hasMore && !isLoading && (
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="mt-6 flex items-center gap-2 text-sm font-medium text-[#68578b] disabled:opacity-50"
          >
            {isFetching && <Loader2 size={14} className="animate-spin" />}
            نمایش نظرات بیشتر
          </button>
        )}
      </div>
    </div>
  );
}
