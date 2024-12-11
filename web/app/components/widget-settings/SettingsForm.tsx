import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem } from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Type, Palette, Settings2, RotateCcw } from "lucide-react";
import AutosaveStatus from "@/components/AutoSaveStatus";
import {
  visualizerSchema,
  type VisualizerSettings,
  defaultSettings,
} from "@/schemas/visualizer";
import { cn } from "@/lib/utils";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { SettingsFormFooter } from "@/components/ui/settings-form-footer";
import { IconAdjustmentsCog } from "@tabler/icons-react";
import { createFormConfig } from "@/utils/form";
import { Switch } from "@/components/ui/switch";
import { GradientColorPicker } from "@/components/GradientColorPicker";

interface SettingsFormProps {
  settings: VisualizerSettings;
  onSettingsChange: (settings: VisualizerSettings) => Promise<void>;
  onPreviewUpdate: (settings: VisualizerSettings) => void;
  isLoading?: boolean;
}

type FieldProps<T> = {
  field: {
    value: T;
    onChange: (value: T) => void;
    onBlur: () => void;
  };
};

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSettingsChange,
  onPreviewUpdate,
  isLoading = false,
}) => {
  const form = useForm({
    resolver: zodResolver(visualizerSchema) as any,
    defaultValues: settings,
    ...createFormConfig(),
  }) as UseFormReturn<VisualizerSettings>;

  const {
    handleSettingChange,
    handleResetToDefaults,
    handleSubmit,
    dialogRef,
    isSaving,
    lastSaved,
    changingField,
    hasPendingChanges,
  } = useSettingsForm({
    form,
    settings,
    onSettingsChange,
    onPreviewUpdate,
    schema: visualizerSchema as any,
    defaultSettings: defaultSettings,
  });

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-[20px] w-full" />
        <Skeleton className="h-[20px] w-full" />
      </div>
    );
  }

  return (
    <Form {...form} onSubmit={handleSubmit}>
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <AutosaveStatus
            lastSaved={lastSaved}
            isSaving={isSaving}
            changingField={changingField}
          />
        </div>
        <div className={cn("flex flex-col space-y-6 relative")}>
          <Card className="border-border/0 bg-transparent rounded-none p-0">
            <CardHeader className="pl-0">
              <CardTitle className="text-xl font-semibold flex items-center gap-2 p-0">
                <div className="rounded-full p-2">
                  <IconAdjustmentsCog className="h-5 w-5" />
                </div>
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple" className="w-full space-y-2">
                {/* Appearance Section */}
                <AccordionItem value="appearance" className="border rounded-md">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span className="font-medium">Appearance</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                    <FormField
                      control={form.control}
                      name="commonSettings.colorSync"
                      render={({
                        field,
                      }: {
                        field: FieldProps<boolean>["field"];
                      }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">
                              Color Sync
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Synchronize colors across all elements
                            </div>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              handleSettingChange(
                                "commonSettings.colorSync",
                                value
                              );
                              onPreviewUpdate({
                                ...form.getValues(),
                                commonSettings: {
                                  ...form.getValues().commonSettings,
                                  colorSync: value,
                                },
                              });
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />

                    {!form.watch("commonSettings.colorSync") && (
                      <FormField
                        control={form.control}
                        name="commonSettings.backgroundColor"
                        render={({
                          field,
                        }: {
                          field: FieldProps<string>["field"];
                        }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">
                                Background Color
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Choose a custom background color
                              </div>
                            </div>
                            <GradientColorPicker
                              color={field.value}
                              onChange={(value) => {
                                handleSettingChange(
                                  "commonSettings.backgroundColor",
                                  value
                                );
                                onPreviewUpdate({
                                  ...form.getValues(),
                                  commonSettings: {
                                    ...form.getValues().commonSettings,
                                    backgroundColor: value,
                                  },
                                });
                              }}
                              onChangeComplete={(value) => {
                                field.onChange(value);
                              }}
                              currentProfile={{}}
                            />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="commonSettings.padding"
                      render={({
                        field,
                      }: {
                        field: FieldProps<number>["field"];
                      }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Padding"
                            min={0}
                            max={100}
                            step={1}
                            value={field.value}
                            onChange={(value) => {
                              handleSettingChange(
                                "commonSettings.padding",
                                value
                              );
                              onPreviewUpdate({
                                ...form.getValues(),
                                commonSettings: {
                                  ...form.getValues().commonSettings,
                                  padding: value,
                                },
                              });
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commonSettings.gap"
                      render={({
                        field,
                      }: {
                        field: FieldProps<number>["field"];
                      }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Element Spacing"
                            min={0}
                            max={6}
                            step={0.5}
                            value={field.value}
                            onChange={(value) => {
                              handleSettingChange("commonSettings.gap", value);
                              onPreviewUpdate({
                                ...form.getValues(),
                                commonSettings: {
                                  ...form.getValues().commonSettings,
                                  gap: value,
                                },
                              });
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visualSettings.albumCanvas"
                      render={({
                        field,
                      }: {
                        field: FieldProps<boolean>["field"];
                      }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">
                              Album Art Video
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Show album artwork in the background
                            </div>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              handleSettingChange(
                                "visualSettings.albumCanvas",
                                value
                              );
                              const currentValues = form.getValues();
                              onPreviewUpdate({
                                ...currentValues,
                                visualSettings: {
                                  ...currentValues.visualSettings,
                                  albumCanvas: value,
                                  backgroundCanvasOpacity: value
                                    ? currentValues.visualSettings
                                        .backgroundCanvasOpacity
                                    : 0,
                                },
                              });
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visualSettings.backgroundCanvas"
                      render={({
                        field,
                      }: {
                        field: FieldProps<boolean>["field"];
                      }) => (
                        <FormItem className="flex flex-col space-y-4">
                          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">
                                Background Video
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Show visualizer canvas in the background
                              </div>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(value) => {
                                handleSettingChange(
                                  "visualSettings.backgroundCanvas",
                                  value
                                );
                                onPreviewUpdate({
                                  ...form.getValues(),
                                  visualSettings: {
                                    ...form.getValues().visualSettings,
                                    backgroundCanvas: value,
                                  },
                                });
                              }}
                              onBlur={field.onBlur}
                            />
                          </div>

                          {field.value && (
                            <FormField
                              control={form.control}
                              name="visualSettings.backgroundCanvasOpacity"
                              render={({
                                field: opacityField,
                              }: {
                                field: FieldProps<number>["field"];
                              }) => (
                                <FormItem>
                                  <SliderWithInput
                                    label="Canvas Video Opacity"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={opacityField.value}
                                    onChange={(value) => {
                                      handleSettingChange(
                                        "visualSettings.backgroundCanvasOpacity",
                                        value
                                      );
                                      onPreviewUpdate({
                                        ...form.getValues(),
                                        visualSettings: {
                                          ...form.getValues().visualSettings,
                                          backgroundCanvasOpacity: value,
                                        },
                                      });
                                    }}
                                    onBlur={opacityField.onBlur}
                                  />
                                </FormItem>
                              )}
                            />
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visualSettings.pauseEnabled"
                      render={({
                        field,
                      }: {
                        field: FieldProps<boolean>["field"];
                      }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">
                              Pause Overlay
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Show overlay when playback is paused
                            </div>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              handleSettingChange(
                                "visualSettings.pauseEnabled",
                                value
                              );
                              const currentValues = form.getValues();
                              onPreviewUpdate({
                                ...currentValues,
                                visualSettings: {
                                  ...currentValues.visualSettings,
                                  pauseEnabled: value,
                                },
                              });
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visualSettings.hideOnDisabled"
                      render={({
                        field,
                      }: {
                        field: FieldProps<boolean>["field"];
                      }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">
                              Hide When Not Playing
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Hide the widget when playback is stopped
                            </div>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(value) => {
                              field.onChange(value);
                              handleSettingChange(
                                "visualSettings.hideOnDisabled",
                                value
                              );
                              const currentValues = form.getValues();
                              onPreviewUpdate({
                                ...currentValues,
                                visualSettings: {
                                  ...currentValues.visualSettings,
                                  hideOnDisabled: value,
                                },
                              });
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />

                    {!form.watch("commonSettings.colorSync") && (
                      <>
                        <FormField
                          control={form.control}
                          name="visualSettings.progressBarForegroundColor"
                          render={({
                            field,
                          }: {
                            field: FieldProps<string>["field"];
                          }) => (
                            <FormItem>
                              <GradientColorPicker
                                color={field.value}
                                onChange={(value) => {
                                  handleSettingChange(
                                    "visualSettings.progressBarForegroundColor",
                                    value
                                  );
                                  onPreviewUpdate({
                                    ...form.getValues(),
                                    visualSettings: {
                                      ...form.getValues().visualSettings,
                                      progressBarForegroundColor: value,
                                    },
                                  });
                                }}
                                onChangeComplete={(value) => {
                                  field.onChange(value);
                                }}
                                currentProfile={{}}
                              />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="visualSettings.progressBarBackgroundColor"
                          render={({
                            field,
                          }: {
                            field: FieldProps<string>["field"];
                          }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <div className="text-sm font-medium">
                                  Progress Bar Background
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Choose the progress bar background color
                                </div>
                              </div>
                              <GradientColorPicker
                                color={field.value}
                                onChange={(value) => {
                                  handleSettingChange(
                                    "visualSettings.progressBarBackgroundColor",
                                    value
                                  );
                                  onPreviewUpdate({
                                    ...form.getValues(),
                                    visualSettings: {
                                      ...form.getValues().visualSettings,
                                      progressBarBackgroundColor: value,
                                    },
                                  });
                                }}
                                onChangeComplete={(value) => {
                                  field.onChange(value);
                                }}
                                currentProfile={{}}
                              />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Text Styling Section */}
                <AccordionItem
                  value="text-styling"
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span className="font-medium">Text Styling</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                    <FormField
                      control={form.control}
                      name="commonSettings.fontSize"
                      render={({
                        field,
                      }: {
                        field: FieldProps<number>["field"];
                      }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Font Size"
                            min={8}
                            max={72}
                            step={1}
                            value={field.value}
                            onChange={(value) => {
                              handleSettingChange(
                                "commonSettings.fontSize",
                                value
                              );
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commonSettings.lineHeight"
                      render={({
                        field,
                      }: {
                        field: FieldProps<number>["field"];
                      }) => (
                        <FormItem>
                          <SliderWithInput
                            label="Line Height"
                            min={0.8}
                            max={3}
                            step={0.1}
                            value={field.value}
                            onChange={(value) => {
                              handleSettingChange(
                                "commonSettings.lineHeight",
                                value
                              );
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <SettingsFormFooter
            onReset={handleResetToDefaults}
            hasPendingChanges={hasPendingChanges}
            dialogRef={dialogRef}
            resetDialogTitle="Reset Visualizer Settings?"
            resetDialogDescription="This will reset all visualizer settings to their default values. This action cannot be undone."
            isSaving={isSaving}
            saveError={null}
            lastSaved={lastSaved}
          />
        </div>
      </div>
    </Form>
  );
};
