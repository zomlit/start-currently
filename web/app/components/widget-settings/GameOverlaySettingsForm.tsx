import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const gameOverlaySettingsSchema = z.object({
  overlayType: z.string(),
  position: z.string(),
  showOverlay: z.boolean(),
});

type GameOverlaySettingsFormProps = {
  settings: z.infer<typeof gameOverlaySettingsSchema>;
  onSettingsChange: (newSettings: z.infer<typeof gameOverlaySettingsSchema>) => void;
};

const GameOverlaySettingsForm: React.FC<GameOverlaySettingsFormProps> = ({
  settings,
  onSettingsChange,
}) => {
  const form = useForm<z.infer<typeof gameOverlaySettingsSchema>>({
    resolver: zodResolver(gameOverlaySettingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (values: z.infer<typeof gameOverlaySettingsSchema>) => {
    onSettingsChange(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="overlayType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overlay Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select overlay type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showOverlay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Show Overlay</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default GameOverlaySettingsForm;
