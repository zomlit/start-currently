import React from "react";
import { FormLabel } from "./form";
import { Input } from "./input";
import { Slider } from "./slider";
import { cn } from "@/lib/utils";

interface SliderWithInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  showTicks?: boolean;
}

export const SliderWithInput = React.forwardRef<
  HTMLDivElement,
  SliderWithInputProps
>(({ value, onChange, onBlur, min, max, step = 1, label, showTicks }, ref) => {
  const tickCount = Math.floor((max - min) / step) + 1;
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    (min + i * step).toFixed(1)
  );
  const displayInterval = tickCount > 20 ? Math.ceil(tickCount / 20) : 1;

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        <Input
          type="number"
          value={value}
          className="h-8 w-fit text-xs text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-2"
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue) && newValue >= min && newValue <= max) {
              onChange(newValue);
            }
          }}
          onBlur={onBlur}
          min={min}
          max={max}
          step={step}
        />
      </div>
      <Slider
        value={[value]}
        max={max}
        min={min}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
        onValueCommit={onBlur}
        className="mt-2"
      />
      {showTicks && (
        <div>
          <span
            className="mt-3 flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium text-muted-foreground"
            aria-hidden="true"
          >
            {ticks.map(
              (tick, index) =>
                index % displayInterval === 0 && (
                  <span
                    key={tick}
                    className="flex w-0 flex-col items-center justify-center gap-2"
                  >
                    <span
                      className={cn(
                        "h-1 w-px bg-muted-foreground/70",
                        index % 2 !== 0 && "h-0.5"
                      )}
                    />
                    <span className={cn(index % 2 !== 0 && "opacity-0")}>
                      {tick}
                    </span>
                  </span>
                )
            )}
          </span>
        </div>
      )}
    </div>
  );
});

SliderWithInput.displayName = "SliderWithInput";
