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
import type { StatsSettings } from "@/types/stats";

const statsSchema = z.object({
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
});

interface StatsSettingsFormProps {
  settings: StatsSettings;
  onSettingsChange: (settings: Partial<StatsSettings>) => Promise<void>;
  onPreviewUpdate?: (settings: Partial<StatsSettings>) => void;
  isLoading?: boolean;
}

export function StatsSettingsForm({
  settings,
  onSettingsChange,
  onPreviewUpdate,
  isLoading = false,
}: StatsSettingsFormProps) {
  const form = useForm({
    resolver: zodResolver(statsSchema),
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
  } = useSettingsForm<StatsSettings>({
    form,
    settings,
    onSettingsChange,
    onPreviewUpdate: onPreviewUpdate || (() => {}),
    schema: statsSchema,
    defaultSettings: settings,
  });

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
                  {/* Background Color */}
                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <GradientColorPicker
                          color={field.value}
                          onChange={(color) =>
                            handleSettingChange("backgroundColor", color)
                          }
                          onChangeComplete={(color) =>
                            handleSettingChange("backgroundColor", color)
                          }
                          currentProfile={null}
                        />
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
                        <GradientColorPicker
                          color={field.value}
                          onChange={(color) =>
                            handleSettingChange("textColor", color)
                          }
                          onChangeComplete={(color) =>
                            handleSettingChange("textColor", color)
                          }
                          currentProfile={null}
                        />
                      </FormItem>
                    )}
                  />

                  {/* Font Size */}
                  <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <SliderWithInput
                          label="Font Size"
                          value={field.value}
                          onChange={(value) =>
                            handleSettingChange("fontSize", value)
                          }
                          onBlur={field.onBlur}
                          min={8}
                          max={72}
                          step={1}
                        />
                      </FormItem>
                    )}
                  />

                  {/* Padding */}
                  <FormField
                    control={form.control}
                    name="padding"
                    render={({ field }) => (
                      <FormItem>
                        <SliderWithInput
                          label="Padding"
                          value={field.value}
                          onChange={(value) =>
                            handleSettingChange("padding", value)
                          }
                          onBlur={field.onBlur}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </FormItem>
                    )}
                  />

                  {/* Show Borders */}
                  <FormField
                    control={form.control}
                    name="showBorders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Show Borders</FormLabel>
                          <FormDescription>
                            Enable or disable borders
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) =>
                              handleSettingChange("showBorders", value)
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Border Settings (only show when borders are enabled) */}
                  {form.watch("showBorders") && (
                    <>
                      {/* Border Color */}
                      <FormField
                        control={form.control}
                        name="borderColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Border Color</FormLabel>
                            <GradientColorPicker
                              color={field.value}
                              onChange={(color) =>
                                handleSettingChange("borderColor", color)
                              }
                              onChangeComplete={(color) =>
                                handleSettingChange("borderColor", color)
                              }
                              currentProfile={null}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Border Width */}
                      <FormField
                        control={form.control}
                        name="borderWidth"
                        render={({ field }) => (
                          <FormItem>
                            <SliderWithInput
                              label="Border Width"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("borderWidth", value)
                              }
                              onBlur={field.onBlur}
                              min={1}
                              max={20}
                              step={1}
                            />
                          </FormItem>
                        )}
                      />

                      {/* Border Radius */}
                      <FormField
                        control={form.control}
                        name="borderRadius"
                        render={({ field }) => (
                          <FormItem>
                            <SliderWithInput
                              label="Border Radius"
                              value={field.value}
                              onChange={(value) =>
                                handleSettingChange("borderRadius", value)
                              }
                              onBlur={field.onBlur}
                              min={0}
                              max={50}
                              step={1}
                            />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {/* Opacity */}
                  <FormField
                    control={form.control}
                    name="opacity"
                    render={({ field }) => (
                      <FormItem>
                        <SliderWithInput
                          label="Opacity"
                          value={field.value}
                          onChange={(value) =>
                            handleSettingChange("opacity", value)
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
                </CardContent>
              </Card>

              <SettingsFormFooter
                onReset={handleResetToDefaults}
                hasPendingChanges={hasPendingChanges}
                dialogRef={dialogRef}
                resetDialogTitle="Reset Stats Settings?"
                resetDialogDescription="This will reset all stats settings to their default values. This action cannot be undone."
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
