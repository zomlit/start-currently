// components/GradientColorPicker.tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Sketch, type ColorResult } from "@uiw/react-color";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Suspense } from "react";
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

interface ColorResultWithAlpha extends ColorResult {
  alpha?: number;
  hsva: { h: number; s: number; v: number; a: number };
  xy: { x: number; y: number };
}

export const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  color = "rgba(0, 0, 0, 1)",
  onChange,
  onChangeComplete,
  currentProfile,
  disabled = false,
}) => {
  const isOpen = React.useRef(false);
  const colorRef = React.useRef(color);
  const [activeTab, setActiveTab] = React.useState<"solid" | "gradient">(
    (color || "").includes("gradient") ? "gradient" : "solid"
  );
  const [startColor, setStartColor] =
    React.useState<ColorResultWithAlpha | null>(null);
  const [endColor, setEndColor] = React.useState<ColorResultWithAlpha | null>(
    null
  );
  const isClient = useIsClient();

  // Parse gradient string on mount and color changes
  React.useEffect(() => {
    if (!color) return;

    if (color.includes("gradient")) {
      const matches = color.match(/rgba?\([^)]+\)/g);
      if (matches && matches.length >= 2) {
        const [start, end] = matches;

        const convertToColorResult = (rgba: string): ColorResultWithAlpha => {
          const values = rgba.match(/\d+(\.\d+)?/g);
          if (values && values.length >= 4) {
            const r = Math.round(+values[0]);
            const g = Math.round(+values[1]);
            const b = Math.round(+values[2]);
            const a = +values[3];

            const hex = `#${r.toString(16).padStart(2, "0")}${g
              .toString(16)
              .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

            return {
              rgb: { r, g, b },
              rgba: { r, g, b, a },
              hsv: { h: 0, s: 0, v: 0 },
              hsva: { h: 0, s: 0, v: 0, a },
              hsl: { h: 0, s: 0, l: 0 },
              hsla: { h: 0, s: 0, l: 0, a },
              hex,
              hexa: `${hex}${Math.round(a * 255)
                .toString(16)
                .padStart(2, "0")}`,
              alpha: a,
              xy: { x: 0, y: 0 },
            };
          }
          return createDefaultColorResult();
        };

        setStartColor(convertToColorResult(start));
        setEndColor(convertToColorResult(end));
      }
    } else {
      // For solid colors, convert the single color
      const convertSolidColor = (color: string): ColorResultWithAlpha => {
        const values = color.match(/\d+(\.\d+)?/g);
        if (values && values.length >= 4) {
          const r = Math.round(+values[0]);
          const g = Math.round(+values[1]);
          const b = Math.round(+values[2]);
          const a = +values[3];

          const hex = `#${r.toString(16).padStart(2, "0")}${g
            .toString(16)
            .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

          return {
            rgb: { r, g, b },
            rgba: { r, g, b, a },
            hsv: { h: 0, s: 0, v: 0 },
            hsva: { h: 0, s: 0, v: 0, a },
            hsl: { h: 0, s: 0, l: 0 },
            hsla: { h: 0, s: 0, l: 0, a },
            hex,
            hexa: `${hex}${Math.round(a * 255)
              .toString(16)
              .padStart(2, "0")}`,
            alpha: a,
            xy: { x: 0, y: 0 },
          };
        }
        return createDefaultColorResult();
      };

      const solidColor = convertSolidColor(color);
      setStartColor(solidColor);
      setEndColor(solidColor);
    }
  }, [color]);

  const createDefaultColorResult = (): ColorResultWithAlpha => ({
    rgb: { r: 0, g: 0, b: 0 },
    rgba: { r: 0, g: 0, b: 0, a: 1 },
    hsv: { h: 0, s: 0, v: 0 },
    hsva: { h: 0, s: 0, v: 0, a: 1 },
    hsl: { h: 0, s: 0, l: 0 },
    hsla: { h: 0, s: 0, l: 0, a: 1 },
    hex: "#000000",
    hexa: "#000000ff",
    alpha: 1,
    xy: { x: 0, y: 0 },
  });

  // Helper to determine if a color string is a gradient
  const isGradient = (color: string = "") => color.includes("gradient");

  // Fix the style conflict by using a single style property
  const getPreviewStyle = (color: string = "") => {
    if (isGradient(color)) {
      return { backgroundImage: color };
    }
    return { backgroundColor: color || "rgba(0, 0, 0, 1)" };
  };

  const handleSketchChange = React.useCallback(
    (colorResult: ColorResult) => {
      const { r, g, b, a } = colorResult.rgba;
      const formattedAlpha = Math.min(1, Math.max(0, a))
        .toFixed(2)
        .replace(/\.?0+$/, "");
      const rgbaString = `rgba(${r}, ${g}, ${b}, ${formattedAlpha})`;

      colorRef.current = rgbaString;
      onChange(rgbaString);
    },
    [onChange]
  );

  const handleGradientChange = React.useCallback(
    (start: ColorResult, end: ColorResult) => {
      const formatColor = (color: ColorResult) => {
        const { r, g, b, a } = color.rgba;
        const alpha = Math.min(1, Math.max(0, a))
          .toFixed(2)
          .replace(/\.?0+$/, "");
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      const startRgba = formatColor(start);
      const endRgba = formatColor(end);
      const gradientString = `linear-gradient(to right, ${startRgba}, ${endRgba})`;

      colorRef.current = gradientString;
      onChange(gradientString);
    },
    [onChange]
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      isOpen.current = open;
      if (!open && colorRef.current) {
        onChangeComplete(colorRef.current);
      }
    },
    [onChangeComplete]
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
    <Suspense
      fallback={
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
      }
    >
      <Popover onOpenChange={handleOpenChange}>
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
          sideOffset={55}
          className={cn(
            "z-50 w-auto mb-4 rounded-lg",
            "bg-white/95 dark:bg-black/95",
            "shadow-lgp-4",
            "data-[state=open]:animate-in data-[state=closed]:animate-out scale-105",
            "data-[state=closed]:blur-sm data-[state=open]:blur-none",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:slide-out-to-right-10 data-[state=open]:slide-in-from-right-10",
            "spring-duration-500 spring-bounce-15"
          )}
        >
          <Tabs
            defaultValue="solid"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "solid" | "gradient")
            }
            className="w-full"
          >
            {/* <TabsList className="w-full mb-2">
              <TabsTrigger value="solid" className="flex-1">
                Solid
              </TabsTrigger>
              <TabsTrigger value="gradient" className="flex-1">
                Gradient
              </TabsTrigger>
            </TabsList> */}

            <TabsContent value="solid" className="mt-2">
              <Sketch
                className={cn(
                  "!shadow-none !border-0 !bg-transparent",
                  "[&_input]:!ring-0 [&_input]:!border-0 [&_input]:!outline-none",
                  "[&_.divider]:!border-white/20",
                  "[&_input]:dark:!text-white [&_input]:!text-black [&_input]:!text-sm",
                  "[&_div[title]]:!rounded-full"
                )}
                color={colorRef.current}
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
            </TabsContent>

            <TabsContent value="gradient" className="mt-2">
              <div className="space-y-4">
                {/* Preview of the gradient */}
                <div
                  className="h-8 w-full rounded-md border border-border/50"
                  style={getPreviewStyle(colorRef.current)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/70">
                      Start Color
                    </label>
                    <Sketch
                      className={cn(
                        "!shadow-none !border-0 !bg-transparent scale-90 origin-top-left",
                        "[&_input]:!ring-0 [&_input]:!border-0 [&_input]:!outline-none",
                        "[&_.divider]:!border-white/20",
                        "[&_input]:dark:!text-white [&_input]:!text-black [&_input]:!text-sm",
                        "[&_div[title]]:!rounded-full"
                      )}
                      color={startColor?.hex || color}
                      onChange={(color) => {
                        setStartColor(color);
                        if (endColor) {
                          handleGradientChange(color, endColor);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/70">
                      End Color
                    </label>
                    <Sketch
                      className={cn(
                        "!shadow-none !border-0 !bg-transparent scale-90 origin-top-left",
                        "[&_input]:!ring-0 [&_input]:!border-0 [&_input]:!outline-none",
                        "[&_.divider]:!border-white/20",
                        "[&_input]:dark:!text-white [&_input]:!text-black [&_input]:!text-sm",
                        "[&_div[title]]:!rounded-full"
                      )}
                      color={endColor?.hex || color}
                      onChange={(color) => {
                        setEndColor(color);
                        if (startColor) {
                          handleGradientChange(startColor, color);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </Suspense>
  );
};
