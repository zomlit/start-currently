import React, { useEffect, useMemo, useCallback } from "react";
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
import { useForm, FormProvider } from "react-hook-form";
import type { WidgetProfile } from "@/types/widget";

// Define valid setting names
type SettingName =
  | "fontFamily"
  | "fontSize"
  | "textColor"
  | "backgroundColor"
  | "padding"
  | "lineHeight"
  | "letterSpacing"
  | "textAlign";

interface SettingsFormProps {
  settings: VisualizerSettings;
  onSettingsChange: (newSettings: Partial<VisualizerSettings>) => void;
}

interface GoogleFont {
  family: string;
  variants: string[];
  files: Record<string, string>;
  category: string;
}

const defaultSettings = {
  fontFamily: "Inter",
  fontSize: 16,
  textColor: "#FFFFFF",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: "left" as const,
};

interface FieldProps {
  value: number;
  onChange: (value: number) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSettingsChange,
}) => {
  const methods = useForm({
    defaultValues: {
      ...defaultSettings,
      ...settings?.commonSettings,
    },
    mode: "onChange",
  });

  // Handle form field changes
  const onFieldChange = useCallback(
    (name: SettingName, value: any) => {
      console.log("🎮 Field Change Triggered:", { name, value });
      try {
        // Update form state
        methods.setValue(name, value, {
          shouldDirty: true,
          shouldTouch: true,
        });

        // Notify parent
        if (onSettingsChange) {
          console.log("📤 Calling onSettingsChange:", { name, value });
          onSettingsChange({ [name]: value });
        }
      } catch (error) {
        console.error("❌ Error in onFieldChange:", error);
      }
    },
    [methods, onSettingsChange]
  );

  // Font loading
  const { data: fonts = [], isLoading: fontsLoading } = useGoogleFonts();
  const currentFont = methods.watch("fontFamily");

  // Memoize the font list
  const fontOptions = useMemo(() => {
    if (fontsLoading) return [];
    return fonts.slice(0, 100).map((font: GoogleFont) => ({
      value: font.family,
      label: font.family,
    }));
  }, [fonts, fontsLoading]);

  return (
    <FormProvider {...methods}>
      <form>
        <Accordion type="single" collapsible defaultValue="text-settings">
          <AccordionItem value="text-settings">
            <AccordionTrigger>Text Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Font Size */}
                <FormField
                  control={methods.control}
                  name="fontSize"
                  render={({ field }: { field: FieldProps }) => (
                    <FormItem>
                      <FormLabel>Font Size</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          min={8}
                          max={72}
                          step={1}
                          onValueChange={([value]) => {
                            console.log("🎯 Slider Value Change:", value);
                            onFieldChange("fontSize", value);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </FormProvider>
  );
};
