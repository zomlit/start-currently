import React, { useState } from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import IconBorderAll from "@icons/outline/border-all.svg?react";
import IconLock from "@icons/outline/lock.svg?react";
import IconLockOpen from "@icons/outline/lock-open.svg?react";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { VisualizerProfile } from "@/types/visualizer";

interface BorderAndSpacingSectionProps {
  form: UseFormReturn<any>;
  handleSettingChange: (field: string, value: any) => void;
  handleSettingCommit: (field: string, value: any) => void;
  localSettings: Record<string, any>;
  widgetType: string;
  currentProfile: VisualizerProfile | null;
}

export function BorderAndSpacingSection({
  form,
  handleSettingChange,
  handleSettingCommit,
  localSettings,
  widgetType,
  currentProfile,
}: BorderAndSpacingSectionProps) {
  const [isBorderLocked, setIsBorderLocked] = useState(true);
  const [isPaddingLocked, setIsPaddingLocked] = useState(true);

  const renderSlider = (
    fieldName: string,
    label: string,
    min: number,
    max: number,
    step: number,
    isLocked: boolean,
    setOtherFields?: (value: number) => void
  ) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            <Input
              className="h-8 w-16 text-xs"
              type="number"
              value={field.value}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                field.onChange(newValue);
                handleSettingChange(fieldName, newValue);
                if (isLocked && setOtherFields) {
                  setOtherFields(newValue);
                }
              }}
              min={min}
              max={max}
              step={step}
            />
          </div>
          <Slider
            min={min}
            max={max}
            step={step}
            value={[field.value as number]}
            onValueChange={(value) => {
              const newValue = value[0];
              field.onChange(newValue);
              handleSettingChange(fieldName, newValue);
              if (isLocked && setOtherFields) {
                setOtherFields(newValue);
              }
            }}
            onValueCommit={(value) => {
              const newValue = value[0];
              handleSettingCommit(fieldName, newValue);
              if (isLocked && setOtherFields) {
                ["Top", "Right", "Bottom", "Left"].forEach((side) => {
                  const sideFieldName = `${fieldName.replace(
                    /Top|Right|Bottom|Left/,
                    ""
                  )}${side}`;
                  handleSettingCommit(sideFieldName, newValue);
                });
              }
            }}
          />
        </FormItem>
      )}
    />
  );

  const setBorderWidths = (value: number) => {
    ["Top", "Right", "Bottom", "Left"].forEach((side) => {
      const fieldName = `commonSettings.border${side}Width`;
      form.setValue(fieldName, value);
      handleSettingChange(fieldName, value);
    });
  };

  const setPaddings = (value: number) => {
    ["Top", "Right", "Bottom", "Left"].forEach((side) => {
      const fieldName = `commonSettings.padding${side}`;
      form.setValue(fieldName, value);
      handleSettingChange(fieldName, value);
    });
  };

  return (
    <AccordionItem
      value="border-and-spacing"
      className="rounded-lg border bg-white/10"
    >
      <AccordionTrigger className="px-4 py-2 text-lg font-medium">
        <div className="flex items-center space-x-2">
          <IconBorderAll className="h-6 w-6" />
          <span>Border & Spacing</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-4 py-4">
        <div className="space-y-4">
          {renderSlider(
            "commonSettings.borderRadius",
            "Border Radius",
            0,
            100,
            1,
            false
          )}

          {/* Border Width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Border Width</h4>
              <Toggle
                pressed={isBorderLocked}
                onPressedChange={setIsBorderLocked}
                aria-label="Toggle border lock"
                size="sm"
              >
                {isBorderLocked ? (
                  <IconLock className="h-4 w-4" />
                ) : (
                  <IconLockOpen className="h-4 w-4" />
                )}
              </Toggle>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderSlider(
                "commonSettings.borderTopWidth",
                "Top",
                0,
                20,
                1,
                isBorderLocked,
                setBorderWidths
              )}
              {renderSlider(
                "commonSettings.borderRightWidth",
                "Right",
                0,
                20,
                1,
                isBorderLocked,
                setBorderWidths
              )}
              {renderSlider(
                "commonSettings.borderBottomWidth",
                "Bottom",
                0,
                20,
                1,
                isBorderLocked,
                setBorderWidths
              )}
              {renderSlider(
                "commonSettings.borderLeftWidth",
                "Left",
                0,
                20,
                1,
                isBorderLocked,
                setBorderWidths
              )}
            </div>
          </div>

          {/* Padding */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Padding</h4>
              <Toggle
                pressed={isPaddingLocked}
                onPressedChange={setIsPaddingLocked}
                aria-label="Toggle padding lock"
                size="sm"
              >
                {isPaddingLocked ? (
                  <IconLock className="h-4 w-4" />
                ) : (
                  <IconLockOpen className="h-4 w-4" />
                )}
              </Toggle>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {renderSlider(
                "commonSettings.paddingTop",
                "Top",
                0,
                100,
                1,
                isPaddingLocked,
                setPaddings
              )}
              {renderSlider(
                "commonSettings.paddingRight",
                "Right",
                0,
                100,
                1,
                isPaddingLocked,
                setPaddings
              )}
              {renderSlider(
                "commonSettings.paddingBottom",
                "Bottom",
                0,
                100,
                1,
                isPaddingLocked,
                setPaddings
              )}
              {renderSlider(
                "commonSettings.paddingLeft",
                "Left",
                0,
                100,
                1,
                isPaddingLocked,
                setPaddings
              )}
            </div>
          </div>

          {/* Gap */}
          {renderSlider("commonSettings.gap", "Gap", 0, 8, 1, false)}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
