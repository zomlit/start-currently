import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const alertsSettingsSchema = z.object({
  sound: z.boolean(),
  volume: z.number().min(0).max(1),
  duration: z.number().min(1),
  // Add more fields as needed
});

type AlertsSettings = z.infer<typeof alertsSettingsSchema>;

interface AlertsSettingsFormProps {
  specificSettings: AlertsSettings;
  onSettingsChange: (newSettings: Partial<AlertsSettings>) => void;
}

const AlertsSettingsForm: React.FC<AlertsSettingsFormProps> = ({
  specificSettings,
  onSettingsChange,
}) => {
  const form = useForm<AlertsSettings>({
    resolver: zodResolver(alertsSettingsSchema),
    defaultValues: specificSettings,
  });

  useEffect(() => {
    if (specificSettings) {
      // Update form values when specificSettings change
      Object.entries(specificSettings).forEach(([key, value]) => {
        form.setValue(key as keyof AlertsSettings, value);
      });
    }
  }, [specificSettings, form]);

  const handleSettingChange = (key: keyof AlertsSettings, value: any) => {
    const newSettings = { ...form.getValues(), [key]: value };
    form.setValue(key, value);
    onSettingsChange(newSettings);
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <FormField
          control={form.control}
          name="sound"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Enable Sound</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => handleSettingChange("sound", checked)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  {...field}
                  onChange={(e) => handleSettingChange("volume", parseFloat(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => handleSettingChange("duration", parseInt(e.target.value, 10))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* Add more form fields for other specific settings */}
      </form>
    </Form>
  );
};

export default AlertsSettingsForm;
