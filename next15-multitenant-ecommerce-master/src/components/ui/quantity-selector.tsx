"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export const QuantitySelector = ({
  quantity,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
  className,
}: QuantitySelectorProps) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  const handleDecrease = () => {
    const newQuantity = Math.max(min, quantity - 1);
    onChange(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleIncrease = () => {
    const newQuantity = Math.min(max, quantity + 1);
    onChange(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) {
      const correctedValue = min;
      onChange(correctedValue);
      setInputValue(correctedValue.toString());
    } else if (numValue > max) {
      const correctedValue = max;
      onChange(correctedValue);
      setInputValue(correctedValue.toString());
    }
  };

  return (
    <div className={cn("flex items-center border rounded-md overflow-hidden", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className="h-8 w-8 p-0 border-0 rounded-none hover:bg-gray-100 flex-shrink-0"
      >
        <MinusIcon className="h-3 w-3" />
      </Button>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleInputBlur}
        disabled={disabled}
        className="flex-1 text-center border-0 outline-none bg-transparent text-sm font-medium min-w-0"
        min={min}
        max={max}
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className="h-8 w-8 p-0 border-0 rounded-none hover:bg-gray-100 flex-shrink-0"
      >
        <PlusIcon className="h-3 w-3" />
      </Button>
    </div>
  );
};
