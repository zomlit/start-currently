import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import IconTypography from "@icons/outline/microphone-2.svg?react";

import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { VisualizerProfile } from "@/types/visualizer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TypographySectionProps {
  form: UseFormReturn<any>;
  handleSettingChange: (field: string, value: any) => void;
  handleSettingCommit: (field: string, value: any) => void;
  currentProfile: VisualizerProfile | null;
  widgetType: string;
  fontFamilies?: string[];
  isFontLoading?: boolean;
  injectFont?: (fontFamily: string) => void;
}

const renderSlider = (
  form: UseFormReturn<any>,
  fieldName: string,
  label: string,
  min: number,
  max: number,
  step: number,
  handleSettingChange: (field: string, value: any) => void,
  handleSettingCommit: (field: string, value: any) => void
) => (
  <FormField
    control={form.control}
    name={fieldName}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[field.value as number]}
          onValueChange={(value) => {
            const newValue = value[0];
            field.onChange(newValue);
            handleSettingChange(fieldName, newValue);
          }}
          onValueCommit={(value) => {
            const newValue = value[0];
            handleSettingCommit(fieldName, newValue);
          }}
        />
      </FormItem>
    )}
  />
);

export function TypographySection({
  form,
  handleSettingChange,
  handleSettingCommit,
  currentProfile,
  widgetType,
  fontFamilies = [],
  isFontLoading = false,
  injectFont,
}: TypographySectionProps) {
  return (
    <AccordionItem value="typography" className="rounded-lg border bg-white/10">
      <AccordionTrigger className="px-4 py-2 text-lg font-medium">
        <div className="flex items-center space-x-2">
          <IconTypography className="h-6 w-6" />
          <span>Typography</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-background/50 px-4 py-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="commonSettings.fontFamily"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Font Family</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleSettingChange("commonSettings.fontFamily", value);
                    handleSettingCommit("commonSettings.fontFamily", value);
                    if (injectFont) {
                      injectFont(value);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isFontLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading fonts...</span>
                      </div>
                    ) : (
                      fontFamilies.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {renderSlider(
            form,
            "commonSettings.fontSize",
            "Font Size",
            8,
            120,
            1,
            handleSettingChange,
            handleSettingCommit
          )}

          {renderSlider(
            form,
            "commonSettings.lineHeight",
            "Line Height",
            0.5,
            3,
            0.1,
            handleSettingChange,
            handleSettingCommit
          )}

          <FormField
            control={form.control}
            name="commonSettings.textTransform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Transform</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleSettingChange("commonSettings.textTransform", value);
                    handleSettingCommit("commonSettings.textTransform", value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select text transform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="capitalize">Capitalize</SelectItem>
                    <SelectItem value="uppercase">Uppercase</SelectItem>
                    <SelectItem value="lowercase">Lowercase</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
