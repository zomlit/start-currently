import React, { useState, useCallback, useEffect } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import IconColorSwatch from "@icons/outline/color-swatch.svg?react";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { useProfile } from "@/hooks/useProfile";
import { WidgetType } from "@/types/widget";

interface ColorSectionProps {
  form: UseFormReturn<any>;
  handleSettingChange: (field: string, value: any) => void;
  handleSettingCommit: (field: string, value: any) => void;
  widgetType: WidgetType;
  isSpecificSetting?: boolean;
}

export function ColorSection({
  form,
  handleSettingChange,
  handleSettingCommit,
  widgetType,
  isSpecificSetting = false,
}: ColorSectionProps) {
  const [localColor, setLocalColor] = useState<Record<string, string>>({});
  const debouncedColor = useDebounce(localColor, 50);

  const handleColorChange = useCallback(
    (field: string) => (color: string) => {
      setLocalColor((prev) => ({ ...prev, [field]: color }));
      form.setValue(field as any, color);
    },
    [form]
  );

  useEffect(() => {
    const field = Object.keys(debouncedColor)[0];
    const color = debouncedColor[field];
    if (field && color) {
      handleSettingChange(field, color);
    }
  }, [debouncedColor, handleSettingChange]);

  const handleColorChangeComplete = useCallback(
    (field: string) => (color: string) => {
      handleSettingCommit(field, color);
    },
    [handleSettingCommit]
  );

  const renderColorPicker = (field: string, label: string) => (
    <FormField
      control={form.control}
      name={field}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <GradientColorPicker
            color={formField.value}
            onChange={handleColorChange(field)}
            onChangeComplete={handleColorChangeComplete(field)}
            currentProfile={null}
          />
        </FormItem>
      )}
    />
  );

  return (
    <AccordionItem value="colors" className="rounded-lg border bg-white/10">
      <AccordionTrigger className="px-4 py-2 text-lg font-medium">
        <div className="flex items-center space-x-2">
          <IconColorSwatch className="h-6 w-6" />
          <span>Colors</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-4 bg-gradient/10">
        <div className="space-y-4">
          {isSpecificSetting ? (
            <>
              {renderColorPicker(
                "specificSettings.progressBarForegroundColor",
                "Progress Bar Foreground Color"
              )}
              {renderColorPicker(
                "specificSettings.progressBarBackgroundColor",
                "Progress Bar Background Color"
              )}
            </>
          ) : (
            <>
              {renderColorPicker(
                "commonSettings.backgroundColor",
                "Background Color"
              )}
              {renderColorPicker("commonSettings.fontColor", "Font Color")}
            </>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
