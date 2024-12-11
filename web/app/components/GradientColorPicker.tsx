// components/GradientColorPicker.tsx
import React, { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import type { ColorResult, HsvaColor, SketchProps } from "@uiw/react-color";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = PopoverPrimitive.Content;

// Dynamically import the color picker
const Sketch = lazy(() =>
  import("@uiw/react-color").then((mod) => ({ default: mod.Sketch }))
);

interface GradientColorPickerProps {
  color?: string;
  onChange: (color: string) => void;
  onChangeComplete: (color: string) => void;
  currentProfile: any;
  disabled?: boolean;
}

interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColor(color: string): ParsedColor {
  const match = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/
  );
  if (match) {
    const [, r, g, b, a = "1"] = match;
    return {
      r: parseInt(r, 10),
      g: parseInt(g, 10),
      b: parseInt(b, 10),
      a: parseFloat(a),
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function colorToString(color: ParsedColor): string {
  const { r, g, b, a } = color;
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(2))})`;
}

function colorResultToRgba(color: ColorResult): string {
  const { r, g, b, a = 1 } = color.rgba;
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(2))})`;
}

function parsedColorToHsva(color: ParsedColor): HsvaColor {
  const { r, g, b, a } = color;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    if (max === rNorm) {
      h = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / diff + 2;
    } else {
      h = (rNorm - gNorm) / diff + 4;
    }
    h *= 60;
  }

  return {
    h,
    s: s * 100,
    v: v * 100,
    a,
  };
}

export function GradientColorPicker({
  color = "rgba(0, 0, 0, 1)",
  onChange,
  onChangeComplete,
  currentProfile,
  disabled = false,
}: GradientColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState(parseColor(color));
  const isChangingRef = React.useRef(false);

  // Update internal color state when prop changes
  React.useEffect(() => {
    setCurrentColor(parseColor(color));
  }, [color]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = React.useCallback(
    (color: ColorResult) => {
      const newColor = colorResultToRgba(color);
      setCurrentColor(parseColor(newColor));
      onChange(newColor);
      isChangingRef.current = true;
    },
    [onChange]
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open && isChangingRef.current) {
        onChangeComplete(colorToString(currentColor));
        isChangingRef.current = false;
      }
    },
    [currentColor, onChangeComplete]
  );

  if (!isMounted) {
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start border-[1px] overflow-hidden",
          "bg-white dark:bg-white/10 px-1 text-left text-xs font-normal h-10",
          "opacity-50"
        )}
        disabled
      >
        <div className="m-2 h-4 min-w-4 self-center truncate rounded-full border-[1px] dark:border-white/20 animate-pulse" />
        <span>Loading color picker...</span>
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start border-[1px] overflow-hidden",
            "bg-white dark:bg-white/10 px-1 text-left text-xs font-normal h-10",
            disabled ? "cursor-not-allowed opacity-20" : "hover:bg-white/15"
          )}
          disabled={disabled}
        >
          <div
            className="m-2 h-4 min-w-4 self-center truncate rounded-full border-[1px] dark:border-white/20"
            style={{ backgroundColor: colorToString(currentColor) }}
          />
          <span className={cn(disabled ? "opacity-20" : "")}>
            {colorToString(currentColor)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="center"
        sideOffset={50}
        alignOffset={40}
        className={cn(
          "z-10 w-auto mb-4",
          "bg-white/95 dark:bg-black/95",
          "shadow-lg p-0",
          "data-[state=open]:animate-in data-[state=closed]:animate-out scale-105",
          "data-[state=closed]:blur-sm data-[state=open]:blur-none",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:slide-out-to-right-10 data-[state=open]:slide-in-from-right-10",
          "spring-duration-500 spring-bounce-15"
        )}
      >
        <Suspense
          fallback={
            <div className="h-[225px] w-[225px] animate-pulse bg-gray-200 dark:bg-gray-800" />
          }
        >
          <Sketch
            className={cn(
              "!shadow-none !border-0 !bg-transparent",
              "[&_input]:!ring-0 [&_input]:!border-0 [&_input]:!outline-none [&_input]:!text-center",
              "[&_.divider]:!border-white/20",
              "[&_input]:dark:!text-white [&_input]:!text-black [&_input]:!text-sm",
              "[&_div[title]]:!rounded-full"
            )}
            color={parsedColorToHsva(currentColor)}
            onChange={handleChange}
            presetColors={[
              "#D0021B",
              "#F5A623",
              "#F8E71C",
              "#8B572A",
              "#7ED321",
              "#417505",
              "#BD10E0",
              "#9013FE",
              "#4A90E2",
              "#50E3C2",
              "#B8E986",
              "#000000",
              "#4A4A4A",
              "#9B9B9B",
              "#FFFFFF",
            ]}
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}
