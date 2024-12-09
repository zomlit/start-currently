// components/GradientColorPicker.tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Sketch, type ColorResult } from "@uiw/react-color";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/useIsClient";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = PopoverPrimitive.Content;

interface GradientColorPickerProps {
  color?: string;
  onChange: (color: string) => void;
  onChangeComplete: (color: string) => void;
  currentProfile: any;
  disabled?: boolean;
}

export function GradientColorPicker({
  color = "rgba(0, 0, 0, 1)",
  onChange,
  onChangeComplete,
  currentProfile,
  disabled = false,
}: GradientColorPickerProps) {
  const isOpen = React.useRef(false);
  const colorRef = React.useRef(color);

  const isClient = useIsClient();

  // Convert rgba to hex
  const rgbaToHex = (rgba: string) => {
    const values = rgba.match(/\d+(\.\d+)?/g);
    if (values && values.length >= 4) {
      const [r, g, b, a] = values.map((v) => parseFloat(v));
      const hex = `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
      const alpha = Math.round(a * 255)
        .toString(16)
        .padStart(2, "0");
      return `${hex}${alpha}`;
    }
    return "#000000ff";
  };

  // Single state for color management
  const [colorState, setColorState] = React.useState(() => {
    const values = color.match(/\d+(\.\d+)?/g);
    if (values && values.length >= 4) {
      const [r, g, b, a] = values.map((v) => parseFloat(v));
      return {
        hex: rgbaToHex(`rgba(${r},${g},${b},${a})`),
        rgba: { r, g, b, a },
      };
    }
    return {
      hex: "#000000ff",
      rgba: { r: 0, g: 0, b: 0, a: 1 },
    };
  });

  // Update state when color prop changes
  React.useEffect(() => {
    colorRef.current = color;
    const values = color.match(/\d+(\.\d+)?/g);
    if (values && values.length >= 4) {
      const [r, g, b, a] = values.map((v) => parseFloat(v));
      setColorState({
        hex: rgbaToHex(color),
        rgba: { r, g, b, a },
      });
    }
  }, [color]);

  const handleSketchChange = React.useCallback(
    (colorResult: ColorResult) => {
      const { r, g, b, a = 1 } = colorResult.rgba;
      const alpha = Number(a).toFixed(2);
      const rgbaString = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      colorRef.current = rgbaString;
      setColorState({
        hex: rgbaToHex(rgbaString),
        rgba: { r, g, b, a: parseFloat(alpha) },
      });
      onChange(rgbaString);
    },
    [onChange]
  );

  // Helper to determine if a color string is a gradient
  const isGradient = (color: string = "") => color.includes("gradient");

  // Fix the style conflict by using a single style property
  const getPreviewStyle = (color: string = "") => {
    if (isGradient(color)) {
      return { backgroundImage: color };
    }
    return { backgroundColor: color || "rgba(0, 0, 0, 1)" };
  };

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open && colorRef.current !== color) {
        onChangeComplete(colorRef.current);
      }
      isOpen.current = open;
    },
    [onChangeComplete, color]
  );

  if (!isClient) {
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
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild className="relative">
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
            style={getPreviewStyle(colorRef.current)}
          />
          <span className={cn(disabled ? "opacity-20" : "")}>
            {colorRef.current || "rgba(0, 0, 0, 1)"}
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
        <Sketch
          className={cn(
            "!shadow-none !border-0 !bg-transparent",
            "[&_input]:!ring-0 [&_input]:!border-0 [&_input]:!outline-none",
            "[&_.divider]:!border-white/20",
            "[&_input]:dark:!text-white [&_input]:!text-black [&_input]:!text-sm",
            "[&_div[title]]:!rounded-full"
          )}
          color={colorState.hex}
          onChange={handleSketchChange}
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
      </PopoverContent>
    </Popover>
  );
}
