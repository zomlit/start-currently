// components/FrequencySelector.tsx
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ProductWithPrices, PricingTierFrequency } from "@/types/checkout";

interface FrequencySelectorProps {
  frequencies: readonly PricingTierFrequency[];
  selectedFrequency: PricingTierFrequency;
  onFrequencyChange: (frequency: PricingTierFrequency) => void;
  products: ProductWithPrices[];
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  frequencies,
  selectedFrequency,
  onFrequencyChange,
  products,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const getLowestPriceForInterval = (interval: string) => {
    const prices = products.flatMap((product) =>
      product.prices.filter((price) => price.recurring?.interval === interval)
    );

    const lowestPrice = prices.reduce(
      (min, price) =>
        price.unit_amount && price.unit_amount < min ? price.unit_amount : min,
      Infinity
    );

    return lowestPrice !== Infinity ? lowestPrice : null;
  };

  return (
    <RadioGroup
      ref={containerRef}
      defaultValue={selectedFrequency.value}
      onValueChange={(value: string) => {
        const newFrequency = frequencies.find((f) => f.value === value);
        if (newFrequency) onFrequencyChange(newFrequency);
      }}
      className="relative flex rounded-full bg-white p-1 text-center text-xs font-semibold ring-1 ring-inset ring-gray-200/30 dark:bg-black/40 dark:ring-gray-800"
    >
      <motion.div
        className="absolute inset-1 rounded-full bg-slate-500/90 dark:bg-white/10"
        initial={false}
        animate={{
          x: selectedFrequency.value === "month" ? 0 : containerWidth / 2 - 4,
          width: containerWidth / 2 - 4,
        }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
      />
      {frequencies.map((option) => {
        const lowestPrice = getLowestPriceForInterval(option.value);
        return (
          <Label
            className={cn(
              "relative z-10 flex flex-1 cursor-pointer flex-col items-center justify-center px-4 py-2 transition-colors",
              selectedFrequency.value === option.value
                ? "text-white"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100",
              option.value === "month" ? "pr-6" : ""
            )}
            key={option.value}
            htmlFor={option.value}
          >
            <span>{option.label}</span>
            {/* Uncomment this if you want to show the lowest price
            <span className="mt-1 text-xs">
              {lowestPrice ? formatPrice({unit_amount: lowestPrice, currency: 'usd'}) : "N/A"}
            </span>
            */}
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="hidden"
            />
          </Label>
        );
      })}
    </RadioGroup>
  );
};
