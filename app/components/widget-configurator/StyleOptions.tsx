import React, { useCallback, useTransition, useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "../ui/form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import * as Slider from "@radix-ui/react-slider";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import GradientColorPicker from "@/components/GradientColorPicker";
import { Switch } from "@/components/ui/switch";

import { cn } from "@/lib/utils";
import { useGoogleFonts } from "@/hooks/useGoogleFonts";
import { useFontVariants } from "@/hooks/useFontVariants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFontVariants } from "@/utils/fonts";
import { WidgetProfile, WidgetSettings, ProfileSettings } from "@/types";
import { useDebouncedCallback } from "use-debounce";
import { startTransition } from "react";
import { OptimisticSettings } from "@/types/widget-settings";
import { useLocalFonts } from "@/hooks/useLocalFonts";
import { loadFont, unloadFont, getLoadedFonts } from "@/utils/fontLoader";

interface StyleOptionsProps {
  currentProfile: WidgetProfile;
  handleProfileChange: (
    settingType: keyof ProfileSettings,
    fieldName: string,
    value: any
  ) => void;
  handleFinalChange: (
    settingType: keyof ProfileSettings,
    fieldName: string,
    value: any
  ) => void;
  colorSyncEnabled: boolean;
  initialOptimisticSettings: ProfileSettings;
  updateProfileSettingProp: (
    settingType: keyof ProfileSettings,
    fieldName: string,
    value: any
  ) => void;
  onPreviewUpdate: (settings: Partial<ProfileSettings>) => void;
}

const StyleOptions: React.FC<StyleOptionsProps> = ({
  currentProfile,
  handleProfileChange,
  handleFinalChange,
  colorSyncEnabled,
  initialOptimisticSettings,
  updateProfileSettingProp,
  onPreviewUpdate,
}) => {
  const [isPending, startTransition] = useTransition();

  const { fonts, isLoading: fontsLoading } = useLocalFonts();
  const { data: fontVariants, isLoading: variantsLoading } = useFontVariants(
    initialOptimisticSettings.commonSettings?.fontFamily || ""
  );

  const [optimisticSettings, setOptimisticSettings] = useState(
    initialOptimisticSettings
  );

  const [localColorSyncEnabled, setLocalColorSyncEnabled] =
    useState(colorSyncEnabled);

  useEffect(() => {
    setLocalColorSyncEnabled(colorSyncEnabled);
  }, [colorSyncEnabled]);

  useEffect(() => {
    setOptimisticSettings(initialOptimisticSettings);
  }, [initialOptimisticSettings]);

  const handleOptimisticChange = useCallback(
    (settingType: keyof ProfileSettings, fieldName: string, value: any) => {
      if (value !== undefined) {
        setOptimisticSettings((prevSettings) => ({
          ...prevSettings,
          [settingType]: {
            ...prevSettings[settingType],
            [fieldName]: value,
          },
        }));
        updateProfileSettingProp(settingType, fieldName, value);
        onPreviewUpdate({ [settingType]: { [fieldName]: value } });
      }
    },
    [updateProfileSettingProp, onPreviewUpdate]
  );

  // Use this for immediate UI updates
  const handleImmediateChange = useCallback(
    (settingType: keyof ProfileSettings, fieldName: string, value: any) => {
      handleOptimisticChange(settingType, fieldName, value);
      handleProfileChange(settingType, fieldName, value);
    },
    [handleOptimisticChange, handleProfileChange]
  );

  // Use this for final changes (e.g., on blur or on change complete)
  const handleSettingFinalChange = useCallback(
    (settingType: keyof ProfileSettings, fieldName: string, value: any) => {
      handleFinalChange(settingType, fieldName, value);
    },
    [handleFinalChange]
  );

  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});

  const renderSlider = useCallback(
    (
      fieldName: string,
      label: string,
      min: number,
      max: number,
      step: number,
      settingType: keyof WidgetSettings = "commonSettings"
    ) => {
      const initialValue = (optimisticSettings[settingType] as any)?.[
        fieldName
      ] as number | undefined;
      const value = sliderValues[fieldName] ?? initialValue ?? min;

      const handleValueChange = (newValue: number[]) => {
        const updatedValue = newValue[0];
        setSliderValues((prev) => ({ ...prev, [fieldName]: updatedValue }));
        updateProfileSettingProp(settingType, fieldName, updatedValue);
        onPreviewUpdate({ [settingType]: { [fieldName]: updatedValue } });
      };

      const handleValueCommit = (newValue: number[]) => {
        const updatedValue = newValue[0];
        handleSettingFinalChange(settingType, fieldName, updatedValue);
      };

      return (
        <FormItem key={fieldName}>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            <Input
              className="xs h-8 w-20 text-xs arrow-hide"
              type="number"
              value={value.toFixed(2)}
              onChange={(e) => {
                const newValue =
                  e.target.value === "" ? min : parseFloat(e.target.value);
                handleValueChange([newValue]);
              }}
              onBlur={() => handleValueCommit([value])}
              step={step}
              min={min}
              max={max}
            />
          </div>
          <Slider.Root
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={handleValueChange}
            onValueCommit={handleValueCommit}
            className="relative flex h-5 w-full touch-none select-none items-center"
          >
            <Slider.Track className="relative h-[3px] grow rounded-full bg-secondary">
              <Slider.Range className="absolute h-full rounded-full bg-primary" />
            </Slider.Track>
            <Slider.Thumb className="block h-5 w-5 rounded-full bg-primary shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
          </Slider.Root>
        </FormItem>
      );
    },
    [
      optimisticSettings,
      sliderValues,
      updateProfileSettingProp,
      onPreviewUpdate,
      handleSettingFinalChange,
    ]
  );

  const handleColorSyncToggle = useCallback(
    (checked: boolean) => {
      console.log("Color sync toggled:", checked);
      setLocalColorSyncEnabled(checked);
      handleImmediateChange("specificSettings", "colorSync", checked);
      handleSettingFinalChange("specificSettings", "colorSync", checked);
    },
    [handleImmediateChange, handleSettingFinalChange]
  );

  const handleColorChange = useCallback(
    (settingType: keyof ProfileSettings, fieldName: string) =>
      (color: string) => {
        handleImmediateChange(settingType, fieldName, color);
      },
    [handleImmediateChange]
  );

  const handleColorChangeComplete = useCallback(
    (settingType: keyof ProfileSettings, fieldName: string) =>
      (color: string) => {
        handleFinalChange(settingType, fieldName, color);
      },
    [handleFinalChange]
  );

  const handleFontFamilyChange = useCallback(
    async (value: string) => {
      await loadFont(value);

      // Unload previously loaded fonts (optional, to save memory)
      getLoadedFonts().forEach((font) => {
        if (font !== value) unloadFont(font);
      });

      const newVariants =
        fonts.find((f) => f.family === value)?.variants.map((v) => v.weight) ||
        [];
      const currentVariant = optimisticSettings.commonSettings?.fontVariant as
        | string
        | undefined;

      const newVariant =
        currentVariant && newVariants.includes(currentVariant)
          ? currentVariant
          : newVariants[0];

      handleImmediateChange("commonSettings", "fontFamily", value);
      handleImmediateChange("commonSettings", "fontVariant", newVariant);
      handleSettingFinalChange("commonSettings", "fontFamily", value);
      handleSettingFinalChange("commonSettings", "fontVariant", newVariant);
    },
    [
      fonts,
      handleImmediateChange,
      handleSettingFinalChange,
      optimisticSettings.commonSettings?.fontVariant,
    ]
  );

  const handleFontVariantChange = useCallback(
    (value: string) => {
      handleImmediateChange("commonSettings", "fontVariant", value);
      handleSettingFinalChange("commonSettings", "fontVariant", value);
    },
    [handleImmediateChange, handleSettingFinalChange]
  );

  useEffect(() => {
    console.log("Optimistic settings:", optimisticSettings);
  }, [colorSyncEnabled, optimisticSettings]);

  return (
    <div className="space-y-4">
      {/* Color Sync */}
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gradient/10">
        <div className="space-y-0.5">
          <FormLabel className="text-base">Color Sync</FormLabel>
          <FormDescription>
            Sync player colors with album artwork
          </FormDescription>
        </div>
        <FormControl>
          <Switch
            checked={localColorSyncEnabled}
            onCheckedChange={handleColorSyncToggle}
          />
        </FormControl>
      </FormItem>

      {/* Color Sync Options */}
      <div
        className={cn(
          "space-y-4 overflow-hidden transition-all duration-300 ease-in-out",
          localColorSyncEnabled
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        {/* Background Opacity */}
        {renderSlider(
          "backgroundOpacity",
          "Background Opacity",
          0,
          1,
          0.01,
          "specificSettings"
        )}

        {/* Sync Text Shadow */}
        <FormItem className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>Sync Text Shadow</FormLabel>
            <FormDescription>
              Apply text shadow based on album colors
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={
                optimisticSettings.specificSettings?.syncTextShadow ?? false
              }
              onCheckedChange={(checked) => {
                handleOptimisticChange(
                  "specificSettings",
                  "syncTextShadow",
                  checked
                );
                handleSettingFinalChange(
                  "specificSettings",
                  "syncTextShadow",
                  checked
                );
              }}
            />
          </FormControl>
        </FormItem>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Text Color */}
        <div>
          <Label htmlFor="textColor">Text Color</Label>
          <GradientColorPicker
            color={optimisticSettings.commonSettings?.textColor ?? "#ffffff"}
            onChange={handleColorChange("commonSettings", "textColor")}
            onChangeComplete={handleColorChangeComplete(
              "commonSettings",
              "textColor"
            )}
            currentProfile={currentProfile}
            disabled={colorSyncEnabled}
          />
        </div>

        {/* Background Color */}
        <div>
          <Label htmlFor="backgroundColor">Background Color</Label>
          <GradientColorPicker
            color={
              optimisticSettings.commonSettings?.backgroundColor ?? "#ffffff"
            }
            onChange={handleColorChange("commonSettings", "backgroundColor")}
            onChangeComplete={handleColorChangeComplete(
              "commonSettings",
              "backgroundColor"
            )}
            currentProfile={currentProfile}
            disabled={colorSyncEnabled}
            alpha={true}
          />
        </div>
      </div>

      {/* Font Family */}
      <div>
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select
          value={optimisticSettings.commonSettings?.fontFamily ?? ""}
          onValueChange={handleFontFamilyChange}
        >
          <SelectTrigger id="fontFamily">
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {fontsLoading ? (
              <SelectItem value="loading">Loading fonts...</SelectItem>
            ) : (
              fonts.map((font) => (
                <SelectItem key={font.family} value={font.family}>
                  {font.family}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Font Variant */}
      <FormItem>
        <FormLabel>Font Variant</FormLabel>
        <Select
          value={optimisticSettings.commonSettings?.fontVariant ?? ""}
          onValueChange={handleFontVariantChange}
          disabled={
            !optimisticSettings.commonSettings?.fontFamily || variantsLoading
          }
        >
          <SelectTrigger id="fontVariant">
            <SelectValue placeholder="Select font variant" />
          </SelectTrigger>
          <SelectContent>
            {variantsLoading ? (
              <SelectItem value="loading">Loading variants...</SelectItem>
            ) : (
              fontVariants?.map((variant) => (
                <SelectItem key={variant.value} value={variant.value}>
                  {variant.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </FormItem>

      {/* Font Size */}
      {renderSlider("fontSize", "Font Size", 8, 72, 1)}

      {/* Border Color */}
      <div>
        <Label htmlFor="borderColor">Border Color</Label>
        <GradientColorPicker
          color={optimisticSettings.commonSettings?.borderColor ?? "#000000"}
          onChange={handleColorChange("commonSettings", "borderColor")}
          onChangeComplete={handleColorChangeComplete(
            "commonSettings",
            "borderColor"
          )}
          currentProfile={currentProfile}
          disabled={colorSyncEnabled}
        />
      </div>

      {/* Border & Spacing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Border & Spacing</h3>

        {/* Border Style */}
        <FormItem>
          <FormLabel>Border Style</FormLabel>
          <RadioGroup
            onValueChange={(value) => {
              handleImmediateChange("commonSettings", "borderStyle", value);
              handleSettingFinalChange("commonSettings", "borderStyle", value);
            }}
            value={optimisticSettings.commonSettings?.borderStyle ?? "none"}
            className="flex flex-wrap gap-2"
          >
            {[
              // { value: "none", label: "None", icon: IconBorderNone },
              // { value: "solid", label: "Solid", icon: IconMinus },
              // { value: "dashed", label: "Dashed", icon: IconLineDashed },
              // { value: "dotted", label: "Dotted", icon: IconLineDotted },
            ].map((option) => (
              <FormItem key={option.value}>
                <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>svg]:stroke-primary">
                  <FormControl>
                    <RadioGroupItem value={option.value} className="sr-only" />
                  </FormControl>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border-[1px] border-muted-foreground bg-popover hover:border-primary">
                    <option.icon className="h-5 w-5 stroke-muted-foreground data-[state=checked]:stroke-primary" />
                  </div>
                </FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        </FormItem>

        {/* Border Radius */}
        {renderSlider("borderRadius", "Border Radius", 0, 100, 1)}

        {/* Border Width */}
        {renderSlider("borderWidth", "Border Width", 0, 20, 1)}

        {/* Padding */}
        {renderSlider("padding", "Padding", 0, 100, 1)}

        {/* Gap */}
        {renderSlider("gap", "Gap", 0, 6, 1)}
      </div>

      {/* Text Shadow */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Text Shadow</h3>

        <FormItem className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>Enable Text Shadow</FormLabel>
            <FormDescription>Apply a shadow effect to the text</FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={
                optimisticSettings.specificSettings?.enableTextShadow ?? false
              }
              onCheckedChange={(checked) => {
                handleOptimisticChange(
                  "specificSettings",
                  "enableTextShadow",
                  checked
                );
                handleSettingFinalChange(
                  "specificSettings",
                  "enableTextShadow",
                  checked
                );
              }}
            />
          </FormControl>
        </FormItem>

        {optimisticSettings.specificSettings?.enableTextShadow && (
          <>
            <FormItem>
              <FormLabel>Text Shadow Color</FormLabel>
              <FormControl>
                <GradientColorPicker
                  color={
                    optimisticSettings.specificSettings?.textShadowColor ??
                    "#000000"
                  }
                  onChange={handleColorChange(
                    "specificSettings",
                    "textShadowColor"
                  )}
                  onChangeComplete={handleColorChangeComplete(
                    "specificSettings",
                    "textShadowColor"
                  )}
                  currentProfile={currentProfile}
                  disabled={
                    colorSyncEnabled ||
                    (optimisticSettings.specificSettings?.syncTextShadow ??
                      false)
                  }
                />
              </FormControl>
            </FormItem>

            {renderSlider(
              "textShadowHorizontal",
              "Horizontal Distance",
              0,
              40,
              1,
              "specificSettings"
            )}
            {renderSlider(
              "textShadowVertical",
              "Vertical Distance",
              0,
              40,
              1,
              "specificSettings"
            )}
            {renderSlider(
              "textShadowBlur",
              "Shadow Blur",
              0,
              50,
              1,
              "specificSettings"
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StyleOptions;
