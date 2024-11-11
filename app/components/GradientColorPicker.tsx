// components/GradientColorPicker.tsx
import React, { useState, useEffect, useCallback } from "react";
import ColorPicker from "react-best-gradient-color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";

interface GradientColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onChangeComplete: (color: string) => void;
  currentProfile: any; // Replace 'any' with the correct type for your profile
  disabled?: boolean;
  alpha?: boolean;
}

export const GradientColorPicker: React.FC<GradientColorPickerProps> = ({
  color,
  onChange,
  onChangeComplete,
  currentProfile,
  disabled = false,
  alpha = false,
}) => {
  const [localColor, setLocalColor] = useState(color);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const debouncedOnChange = useCallback(
    debounce((newColor: string) => {
      onChange(newColor);
    }, 50),
    [onChange]
  );

  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    debouncedOnChange(newColor);
  };

  const handlePopoverClose = () => {
    setIsOpen(false);
    onChangeComplete(localColor);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            style={{ backgroundColor: localColor }}
          />
          <span className={cn(disabled ? "opacity-20" : "")}>
            {localColor || "Pick a color"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-50 w-auto bg-white/10 p-2 backdrop-blur-md"
        onInteractOutside={handlePopoverClose}
      >
        <ColorPicker
          value={localColor}
          onChange={handleColorChange}
          height={150}
          alpha={alpha}
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
              onClick={() =>
                !disabled && handleColorChange(currentProfile.color)
              }
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
