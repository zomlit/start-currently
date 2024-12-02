// components/GradientColorPicker.tsx
import React from "react";
import ColorPicker from "react-best-gradient-color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onChangeComplete: (color: string) => void;
  currentProfile: any;
  disabled?: boolean;
}

export const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  color,
  onChange,
  onChangeComplete,
  currentProfile,
  disabled = false,
}) => {
  const [previewColor, setPreviewColor] = React.useState(color);

  React.useEffect(() => {
    setPreviewColor(color);
  }, [color]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start overflow-hidden border-0 bg-white/10 px-1 text-left text-xs font-normal",
            disabled ? "cursor-not-allowed opacity-20" : "hover:bg-white/15"
          )}
          disabled={disabled}
        >
          <div
            className="m-2 h-4 min-w-4 self-center truncate rounded-full"
            style={{ backgroundColor: previewColor }}
          />
          <span className={cn(disabled ? "opacity-20" : "")}>
            {previewColor || "Pick a color"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-50 w-auto bg-white/10 p-2 backdrop-blur-md"
        onInteractOutside={() => {
          onChangeComplete(previewColor);
          setPreviewColor(color);
        }}
      >
        <ColorPicker
          value={color}
          onChange={(newColor) => {
            setPreviewColor(newColor);
            onChange(newColor);
          }}
          onComplete={onChangeComplete}
          height={150}
        />

        {currentProfile && (
          <div className="mt-2 flex space-x-2">
            <div
              className={cn(
                "h-6 w-6 rounded-full border border-gray-300",
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-primary"
              )}
              style={{ backgroundColor: currentProfile.color }}
              onClick={() => {
                if (!disabled) {
                  setPreviewColor(currentProfile.color);
                  onChange(currentProfile.color);
                }
              }}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
