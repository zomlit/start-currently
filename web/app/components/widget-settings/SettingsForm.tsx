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
  defaultVisualizerSettings,
} from "@/schemas/visualizer";
import { cn } from "@/lib/utils";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { SettingsFormFooter } from "@/components/ui/settings-form-footer";
import { IconAdjustmentsCog } from "@tabler/icons-react";
import { createFormConfig } from "@/utils/form";

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
