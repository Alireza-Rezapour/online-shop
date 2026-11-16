"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useCreateReviewMutation } from "@/redux/services/reviewApi";

interface WriteReviewFormProps {
  productId: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function WriteReviewForm({
  productId,
  onSubmitted,
  onCancel,
}: WriteReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [createReview, { isLoading }] = useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("لطفا امتیاز خود را انتخاب کنید");
      return;
    }
    if (!comment.trim()) {
      setError("لطفا متن نظر را وارد کنید");
      return;
    }

    try {
      await createReview({
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      }).unwrap();
      onSubmitted();
    } catch (err) {
      setError(
        (err as { data?: { message?: string } })?.data?.message ??
          "ثبت نظر با خطا مواجه شد",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${n} ستاره`}
            className="p-0.5"
          >
            <Star
              size={20}
              className={
                n <= (hoverRating || rating)
                  ? "fill-[#68578b] text-[#68578b]"
                  : "text-[#e8e5e1]"
              }
            />
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان (اختیاری)"
        maxLength={100}
        className="rounded-lg border border-[#e8e5e1] px-3 py-2 text-sm outline-none focus:border-[#68578b]"
      />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="نظر خود را بنویسید..."
        rows={4}
        maxLength={2000}
        className="resize-none rounded-lg border border-[#e8e5e1] px-3 py-2 text-sm outline-none focus:border-[#68578b]"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-[#68578b] px-5 py-2 text-sm font-medium text-white hover:bg-[#544571] disabled:opacity-50"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          ثبت نظر
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-[#1c1a1f]/55 hover:text-[#1c1a1f]"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
