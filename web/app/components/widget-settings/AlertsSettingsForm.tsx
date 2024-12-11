import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { cn } from "@/lib/utils";
import { SettingsFormFooter } from "@/components/ui/settings-form-footer";
import type { AlertsSettings } from "@/types/alerts";

const alertsSchema = z.object({
  backgroundColor: z.string(),
  textColor: z.string(),
  fontSize: z.number(),
  fontFamily: z.string(),
  padding: z.number(),
  showBorders: z.boolean(),
  borderColor: z.string(),
  borderWidth: z.number(),
  borderRadius: z.number(),
  opacity: z.number(),
  animationDuration: z.number(),
  soundEnabled: z.boolean(),
  soundVolume: z.number(),
});

interface AlertsSettingsFormProps {
  settings: AlertsSettings;
  onSettingsChange: (settings: Partial<AlertsSettings>) => Promise<void>;
  onPreviewUpdate?: (settings: Partial<AlertsSettings>) => void;
  isLoading?: boolean;
}

export function AlertsSettingsForm({
  settings,
  onSettingsChange,
  onPreviewUpdate,
  isLoading = false,
}: AlertsSettingsFormProps) {
  const form = useForm({
    resolver: zodResolver(alertsSchema),
    defaultValues: settings,
  });

  const {
    handleSettingChange,
    handleResetToDefaults,
    handleSubmit,
    dialogRef,
    isSaving,
    lastSaved,
    changingField,
    hasPendingChanges,
  } = useSettingsForm<AlertsSettings>({
    form,
    settings,
    onSettingsChange,
    onPreviewUpdate: onPreviewUpdate || (() => {}),
    schema: alertsSchema,
    defaultSettings: settings,
  });

  const soundEnabled = form.watch("soundEnabled");

  return (
    <FormProvider {...form}>
      <Form {...form} onSubmit={handleSubmit}>
        <div className="relative">
          <div
            className={cn(
              "flex flex-col",
              isLoading && "opacity-50 pointer-events-none"
            )}
          >
            <div className="space-y-6">
              <Card className="border-border/0 bg-transparent rounded-none p-0">
                <CardContent className="p-0 space-y-4">
                  {/* Animation Duration */}
                  <FormField
                    control={form.control}
                    name="animationDuration"
                    render={({ field }) => (
                      <FormItem>
                        <SliderWithInput
                          label="Animation Duration (ms)"
                          value={field.value}
                          onChange={(value) =>
                            handleSettingChange("animationDuration", value)
                          }
                          onBlur={field.onBlur}
                          min={500}
                          max={10000}
                          step={100}
                        />
                      </FormItem>
                    )}
                  />

                  {/* Sound Enabled */}
                  <FormField
                    control={form.control}
                    name="soundEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Sound</FormLabel>
                          <FormDescription>
                            Play sound with alerts
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) =>
                              handleSettingChange("soundEnabled", value)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Sound Volume (only when sound is enabled) */}
                  {soundEnabled && (
                    <FormField
                      control={form.control}
                      name="soundVolume"
                      render={({ field }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Sound Volume"
                            value={field.value}
                            onChange={(value) =>
                              handleSettingChange("soundVolume", value)
                            }
                            onBlur={field.onBlur}
                            min={0}
                            max={100}
                            step={1}
                            formatValue={(value) => `${value}%`}
                          />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Include all the common styling fields (background, text, borders, etc.) */}
                  {/* ... (similar to StatsSettingsForm) ... */}
                </CardContent>
              </Card>

              <SettingsFormFooter
                onReset={handleResetToDefaults}
                hasPendingChanges={hasPendingChanges}
                dialogRef={dialogRef}
                resetDialogTitle="Reset Alerts Settings?"
                resetDialogDescription="This will reset all alerts settings to their default values. This action cannot be undone."
                isSaving={isSaving}
                saveError={null}
                lastSaved={lastSaved}
              />
            </div>
          </div>
        </div>
      </Form>
    </FormProvider>
  );
}
