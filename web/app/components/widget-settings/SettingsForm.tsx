import React, { useRef, useState, useCallback } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/toast";
import { useDebouncedCallback } from "use-debounce";
import AutosaveStatus from "@/components/AutoSaveStatus";
import { useIsClient } from "@/hooks/useIsClient";
import {
  visualizerSchema,
  type VisualizerSettings,
  defaultVisualizerSettings,
} from "@/schemas/visualizer";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsFormProps {
  settings: VisualizerSettings;
  onSettingsChange: (settings: VisualizerSettings) => Promise<void>;
  onPreviewUpdate: (settings: VisualizerSettings) => void;
  isLoading?: boolean;
}

type FieldProps = {
  field: {
    value: number;
    onChange: (value: number) => void;
    onBlur: () => void;
  };
};

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSettingsChange,
  onPreviewUpdate,
  isLoading = false,
}) => {
  const isClient = useIsClient();

  const form = useForm<VisualizerSettings>({
    resolver: zodResolver(visualizerSchema),
    defaultValues: settings,
    disabled: !isClient,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    criteriaMode: "firstError",
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
  } = useSettingsForm({
    form,
    settings,
    onSettingsChange,
    onPreviewUpdate,
    schema: visualizerSchema,
    defaultSettings: defaultVisualizerSettings,
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
          <Card className="border-border/0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Visualizer Settings
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
                    {/* Add appearance settings here */}
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
                      render={({ field }: FieldProps) => (
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
                            onBlur={() => {
                              handleSettingChange(
                                "commonSettings.fontSize",
                                field.value
                              );
                            }}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="commonSettings.lineHeight"
                      render={({ field }: FieldProps) => (
                        <FormItem>
                          <SliderWithInput
                            label="Line Height"
                            min={0.5}
                            max={3}
                            step={0.1}
                            value={field.value}
                            onChange={(value) => {
                              handleSettingChange(
                                "commonSettings.lineHeight",
                                value
                              );
                            }}
                            onBlur={() => {
                              handleSettingChange(
                                "commonSettings.lineHeight",
                                field.value
                              );
                            }}
                          />
                        </FormItem>
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  ref={dialogRef}
                >
                  <RotateCcw className="size-4" />
                  Reset to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                {/* ... Alert dialog content ... */}
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              className="w-full"
              disabled={!hasPendingChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};
