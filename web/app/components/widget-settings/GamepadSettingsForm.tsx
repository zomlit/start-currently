import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings2, Gamepad2, Sliders, Palette, Chrome } from "lucide-react";
import { IconAdjustmentsCog } from "@tabler/icons-react";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { cn } from "@/lib/utils";
import AutosaveStatus from "@/components/AutoSaveStatus";
import { SettingsFormFooter } from "@/components/ui/settings-form-footer";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import {
  gamepadSchema,
  type GamepadSettings,
  defaultGamepadSettings,
  CONTROLLER_TYPES,
  CONTROLLER_COLORS,
} from "@/schemas/gamepad";
import { useGamepadContext } from "@/providers/GamepadProvider";

interface GamepadSettingsFormProps {
  settings: GamepadSettings;
  onSettingsChange: (settings: Partial<GamepadSettings>) => Promise<void>;
  onPreviewUpdate?: (settings: Partial<GamepadSettings>) => void;
  isLoading?: boolean;
  isExtensionEnabled?: boolean;
  toggleExtension?: () => void;
}

export function GamepadSettingsForm({
  settings,
  onSettingsChange,
  onPreviewUpdate,
  isLoading = false,
  isExtensionEnabled = false,
  toggleExtension,
}: GamepadSettingsFormProps) {
  const form = useForm({
    resolver: zodResolver(gamepadSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      // Do nothing - just to prevent form reset on every render
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings]);

  const {
    handleSettingChange,
    handleResetToDefaults,
    handleSubmit,
    dialogRef,
    isSaving,
    lastSaved,
    changingField,
    hasPendingChanges,
  } = useSettingsForm<GamepadSettings>({
    form,
    settings,
    onSettingsChange,
    onPreviewUpdate: onPreviewUpdate || (() => {}),
    schema: gamepadSchema as z.ZodType<GamepadSettings>,
    defaultSettings: defaultGamepadSettings,
  });

  const useCustomShapeColors = form.watch("useCustomShapeColors");
  const hideWhenInactive = form.watch("hideWhenInactive");

  return (
    <FormProvider {...form}>
      <Form {...form} onSubmit={handleSubmit}>
        <div className="relative">
          <div className="fixed top-4 right-4 z-50">
            <AutosaveStatus
              lastSaved={lastSaved}
              isSaving={isSaving}
              changingField={changingField}
            />
          </div>

          <div
            className={cn(
              "flex flex-col",
              isLoading && "opacity-50 pointer-events-none"
            )}
          >
            <div className="space-y-6">
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
                    {/* Keep all your existing accordion items */}
                    {/* Controller Settings */}
                    <AccordionItem
                      value="controller"
                      className="border rounded-md"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          <span className="font-medium">
                            Controller Settings
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                        {/* Controller Type */}
                        <FormField
                          control={form.control}
                          name="controllerType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Controller Type</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) =>
                                  handleSettingChange("controllerType", value)
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select controller" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CONTROLLER_TYPES.map((type) => (
                                    <SelectItem
                                      key={type.id}
                                      value={type.id}
                                      disabled={type.disabled}
                                    >
                                      <div className="flex items-center gap-2">
                                        <type.icon className="h-4 w-4" />
                                        <span>{type.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Controller Color */}
                        <FormField
                          control={form.control}
                          name="controllerColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Controller Color</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) =>
                                  handleSettingChange("controllerColor", value)
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CONTROLLER_COLORS.map((color) => (
                                    <SelectItem key={color.id} value={color.id}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-4 w-4 rounded-full border"
                                          style={{ backgroundColor: color.hex }}
                                        />
                                        <span>{color.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* Scale */}
                        <FormField
                          control={form.control}
                          name="scale"
                          render={({ field }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Scale"
                                value={field.value}
                                onChange={(value) =>
                                  handleSettingChange("scale", value)
                                }
                                onBlur={field.onBlur}
                                min={0.1}
                                max={2}
                                step={0.1}
                              />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Colors Section */}
                    <AccordionItem value="colors" className="border rounded-md">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          <span className="font-medium">Colors</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                        {/* Button Color */}
                        <FormField
                          control={form.control}
                          name="buttonColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Color</FormLabel>
                              <GradientColorPicker
                                color={field.value}
                                onChange={(color) =>
                                  handleSettingChange("buttonColor", color)
                                }
                                onChangeComplete={(color) =>
                                  handleSettingChange("buttonColor", color)
                                }
                                currentProfile={null}
                              />
                            </FormItem>
                          )}
                        />

                        {/* Button Pressed Color */}
                        <FormField
                          control={form.control}
                          name="buttonPressedColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Button Pressed Color</FormLabel>
                              <GradientColorPicker
                                color={field.value}
                                onChange={(color) =>
                                  handleSettingChange(
                                    "buttonPressedColor",
                                    color
                                  )
                                }
                                onChangeComplete={(color) =>
                                  handleSettingChange(
                                    "buttonPressedColor",
                                    color
                                  )
                                }
                                currentProfile={null}
                              />
                            </FormItem>
                          )}
                        />

                        {/* Stick Color */}
                        <FormField
                          control={form.control}
                          name="stickColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stick Color</FormLabel>
                              <GradientColorPicker
                                color={field.value}
                                onChange={(color) =>
                                  handleSettingChange("stickColor", color)
                                }
                                onChangeComplete={(color) =>
                                  handleSettingChange("stickColor", color)
                                }
                                currentProfile={null}
                              />
                            </FormItem>
                          )}
                        />

                        {/* Trigger Color */}
                        <FormField
                          control={form.control}
                          name="triggerColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trigger Color</FormLabel>
                              <GradientColorPicker
                                color={field.value}
                                onChange={(color) =>
                                  handleSettingChange("triggerColor", color)
                                }
                                onChangeComplete={(color) =>
                                  handleSettingChange("triggerColor", color)
                                }
                                currentProfile={null}
                              />
                            </FormItem>
                          )}
                        />

                        {/* Custom Shape Colors */}
                        <FormField
                          control={form.control}
                          name="useCustomShapeColors"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Custom Shape Colors</FormLabel>
                                <FormDescription>
                                  Use custom colors for button shapes
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(value) =>
                                    handleSettingChange(
                                      "useCustomShapeColors",
                                      value
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {useCustomShapeColors && (
                          <>
                            <FormField
                              control={form.control}
                              name="buttonShapeColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Button Shape Color</FormLabel>
                                  <GradientColorPicker
                                    color={field.value}
                                    onChange={(color) =>
                                      handleSettingChange(
                                        "buttonShapeColor",
                                        color
                                      )
                                    }
                                    onChangeComplete={(color) =>
                                      handleSettingChange(
                                        "buttonShapeColor",
                                        color
                                      )
                                    }
                                    currentProfile={null}
                                  />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="buttonShapePressedColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Button Shape Pressed Color
                                  </FormLabel>
                                  <GradientColorPicker
                                    color={field.value}
                                    onChange={(color) =>
                                      handleSettingChange(
                                        "buttonShapePressedColor",
                                        color
                                      )
                                    }
                                    onChangeComplete={(color) =>
                                      handleSettingChange(
                                        "buttonShapePressedColor",
                                        color
                                      )
                                    }
                                    currentProfile={null}
                                  />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Advanced Settings */}
                    <AccordionItem
                      value="advanced"
                      className="border rounded-md"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-md">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4" />
                          <span className="font-medium">Advanced Settings</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-4 bg-violet-50 dark:bg-violet-500/10 shadow-inner">
                        {/* Deadzone */}
                        <FormField
                          control={form.control}
                          name="deadzone"
                          render={({ field }) => (
                            <FormItem>
                              <SliderWithInput
                                label="Deadzone"
                                value={field.value}
                                onChange={(value) =>
                                  handleSettingChange("deadzone", value)
                                }
                                onBlur={field.onBlur}
                                min={0}
                                max={1}
                                step={0.01}
                                formatValue={(value) => value.toFixed(2)}
                              />
                            </FormItem>
                          )}
                        />

                        {/* Hide When Inactive */}
                        <FormField
                          control={form.control}
                          name="hideWhenInactive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Hide When Inactive</FormLabel>
                                <FormDescription>
                                  Hide controller when no input is detected
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(value) =>
                                    handleSettingChange(
                                      "hideWhenInactive",
                                      value
                                    )
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Inactivity Timeout - Only show when hideWhenInactive is true */}
                        {hideWhenInactive && (
                          <FormField
                            control={form.control}
                            name="inactivityTimeout"
                            render={({ field }) => (
                              <FormItem>
                                <SliderWithInput
                                  label="Inactivity Timeout (seconds)"
                                  value={field.value}
                                  onChange={(value) =>
                                    handleSettingChange(
                                      "inactivityTimeout",
                                      value
                                    )
                                  }
                                  onBlur={field.onBlur}
                                  min={1}
                                  max={60}
                                  step={1}
                                />
                              </FormItem>
                            )}
                          />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <SettingsFormFooter
                onReset={handleResetToDefaults}
                hasPendingChanges={hasPendingChanges}
                dialogRef={dialogRef}
                resetDialogTitle="Reset Gamepad Settings?"
                resetDialogDescription="This will reset all gamepad settings to their default values. This action cannot be undone."
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
