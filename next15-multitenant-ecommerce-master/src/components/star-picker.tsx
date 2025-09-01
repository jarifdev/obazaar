"use client";

import { useState } from "react";

const StarSvg = ({ className = "size-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.556L19.335 24 12 19.897 4.665 24l1.635-8.694L.6 9.75l7.732-1.732L12 .587z" />
  </svg>
);

import { cn } from "@/lib/utils";

interface StarPickerProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const StarPicker = ({
  value = 0,
  onChange,
  disabled,
  className,
}: StarPickerProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleChange = (rating: number) => {
    if (!disabled) {
      onChange?.(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(0);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = (hoverValue || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            className={cn(
              "p-0.5 transition-all duration-200 ease-in-out",
              !disabled && "cursor-pointer hover:scale-110 active:scale-95"
            )}
            onClick={() => handleChange(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
          >
            <StarSvg
              className={cn(
                "size-5 transition-colors duration-200",
                isActive
                  ? "fill-yellow-400 stroke-yellow-400 text-yellow-400"
                  : "fill-none stroke-gray-300 hover:stroke-yellow-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
