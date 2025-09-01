import { cn } from "@/lib/utils";

const MAX_RATING = 5;
const MIN_RATING = 0;

interface StarRatingProps {
  rating: number;
  className?: string;
  iconClassName?: string;
  text?: string;
}

export const StarRating = ({
  rating,
  className,
  iconClassName,
  text,
}: StarRatingProps) => {
  const safeRating = Math.max(MIN_RATING, Math.min(rating, MAX_RATING));

  return (
    <div className={cn("flex items-center gap-x-1", className)}>
      {Array.from({ length: MAX_RATING }).map((_, index) => (
        <svg
          key={index}
          className={cn(
            "w-4 h-4",
            index < safeRating
              ? "fill-yellow-400 stroke-yellow-400"
              : "fill-none stroke-gray-300",
            iconClassName
          )}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.335 24 12 19.897 4.665 24l1.635-8.694L.6 9.75l7.732-1.732L12 .587z" />
        </svg>
      ))}
      {text && <p>{text}</p>}
    </div>
  );
};
