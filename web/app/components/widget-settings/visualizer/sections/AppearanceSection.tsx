import { Control, UseFormWatch } from "react-hook-form";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Palette } from "lucide-react";
import type { VisualizerSettings } from "@/schemas/visualizer";

interface AppearanceSectionProps {
  control: Control<VisualizerSettings>;
  watch: UseFormWatch<VisualizerSettings>;
  onSettingChange: (key: keyof VisualizerSettings, value: any) => void;
  onSettingCommit: (key: keyof VisualizerSettings, value: any) => void;
  colorSyncEnabled: boolean;
}

export function AppearanceSection({
  control,
  watch,
  onSettingChange,
  onSettingCommit,
  colorSyncEnabled,
}: AppearanceSectionProps) {
  const backgroundColor = watch("commonSettings.backgroundColor");

  return (
    <AccordionItem value="appearance" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:rounded-t-lg [&[data-state=closed]]:rounded-lg">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="font-medium">Appearance</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
        <FormField
          control={control}
          name="commonSettings.backgroundColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Color</FormLabel>
              {/* Your color picker component */}
            </FormItem>
          )}
        />
        {/* Add other appearance fields */}
      </AccordionContent>
    </AccordionItem>
  );
}
