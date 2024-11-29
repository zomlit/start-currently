import React, { useEffect, useMemo } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoogleFonts } from "@/hooks/useGoogleFonts";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFormContext } from "react-hook-form";
import type { WidgetProfile } from "@/types/widget";

interface SettingsFormProps {
  handleSettingChange: (key: string, value: any) => void;
  handleSettingCommit: (key: string, value: any) => void;
  currentProfile: WidgetProfile;
  colorSyncEnabled?: boolean;
}

interface GoogleFont {
  family: string;
  variants: string[];
  files: Record<string, string>;
  category: string;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  handleSettingChange,
  handleSettingCommit,
  currentProfile,
  colorSyncEnabled = false,
}) => {
  const form = useFormContext();
  const { data: fonts = [], isLoading: fontsLoading } = useGoogleFonts();
  const currentFont = form.watch("fontFamily");

  // Memoize the font list to prevent unnecessary re-renders
  const fontOptions = useMemo(() => {
    if (fontsLoading) return [];
    // Only show the first 100 fonts for better performance
    return fonts.slice(0, 100).map((font: GoogleFont) => ({
      value: font.family,
      label: font.family,
    }));
  }, [fonts, fontsLoading]);

  // Load font when selected
  useEffect(() => {
    if (!currentFont) return;

    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      currentFont
    )}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [currentFont]);

  return (
    <Accordion type="single" collapsible defaultValue="text-settings">
      <AccordionItem value="text-settings">
        <AccordionTrigger>Text Settings</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {/* Font Family */}
            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Family</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      handleSettingChange("fontFamily", value);
                      handleSettingCommit("fontFamily", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontsLoading ? (
                        <SelectItem value="loading">
                          Loading fonts...
                        </SelectItem>
                      ) : (
                        fontOptions.map(({ value, label }) => (
                          <SelectItem
                            key={value}
                            value={value}
                            className="font-normal"
                          >
                            {label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Font Size */}
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Size</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={8}
                      max={72}
                      step={1}
                      onValueChange={([value]) =>
                        handleSettingChange("fontSize", value)
                      }
                      onValueCommit={([value]) =>
                        handleSettingCommit("fontSize", value)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Line Height */}
            <FormField
              control={form.control}
              name="lineHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Line Height</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={([value]) =>
                        handleSettingChange("lineHeight", value)
                      }
                      onValueCommit={([value]) =>
                        handleSettingCommit("lineHeight", value)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Letter Spacing */}
            <FormField
              control={form.control}
              name="letterSpacing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Letter Spacing</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={-2}
                      max={10}
                      step={0.5}
                      onValueChange={([value]) =>
                        handleSettingChange("letterSpacing", value)
                      }
                      onValueCommit={([value]) =>
                        handleSettingCommit("letterSpacing", value)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Text Alignment */}
            <FormField
              control={form.control}
              name="textAlign"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Alignment</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      handleSettingChange("textAlign", value);
                      handleSettingCommit("textAlign", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select text alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Text Color */}
            <FormField
              control={form.control}
              name="textColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Color</FormLabel>
                  <FormControl>
                    <GradientColorPicker
                      color={field.value}
                      onChange={(color) =>
                        handleSettingChange("textColor", color)
                      }
                      onChangeComplete={(color) =>
                        handleSettingCommit("textColor", color)
                      }
                      currentProfile={currentProfile}
                      disabled={colorSyncEnabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Background Color */}
            <FormField
              control={form.control}
              name="backgroundColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <FormControl>
                    <GradientColorPicker
                      color={field.value}
                      onChange={(color) =>
                        handleSettingChange("backgroundColor", color)
                      }
                      onChangeComplete={(color) =>
                        handleSettingCommit("backgroundColor", color)
                      }
                      currentProfile={currentProfile}
                      disabled={colorSyncEnabled}
                      alpha={true}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Padding */}
            <FormField
              control={form.control}
              name="padding"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Padding</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([value]) =>
                        handleSettingChange("padding", value)
                      }
                      onValueCommit={([value]) =>
                        handleSettingCommit("padding", value)
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
