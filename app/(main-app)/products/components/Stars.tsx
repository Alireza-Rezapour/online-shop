import { Star } from "lucide-react";

interface StarsProps {
  rating: number;
  size?: number;
}

export default function Stars({ rating, size = 14 }: StarsProps) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-[#68578b] text-[#68578b]"
              : "fill-transparent text-[#d8d5d0]"
          }
        />
      ))}
    </div>
  );
}
