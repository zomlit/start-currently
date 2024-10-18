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

const gamepadOverlaySettingsSchema = z.object({
  controllerType: z.string(),
  showButtons: z.boolean(),
  showSticks: z.boolean(),
});

type GamepadOverlaySettingsFormProps = {
  settings: z.infer<typeof gamepadOverlaySettingsSchema>;
  onSettingsChange: (newSettings: z.infer<typeof gamepadOverlaySettingsSchema>) => void;
};

const GamepadOverlaySettingsForm: React.FC<GamepadOverlaySettingsFormProps> = ({
  settings,
  onSettingsChange,
}) => {
  const form = useForm<z.infer<typeof gamepadOverlaySettingsSchema>>({
    resolver: zodResolver(gamepadOverlaySettingsSchema),
    defaultValues: settings,
  });

  const onSubmit = (values: z.infer<typeof gamepadOverlaySettingsSchema>) => {
    onSettingsChange(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="controllerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Controller Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select controller type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="xbox">Xbox</SelectItem>
                  <SelectItem value="playstation">PlayStation</SelectItem>
                  <SelectItem value="nintendo">Nintendo</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showButtons"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Show Buttons</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="showSticks"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Show Sticks</FormLabel>
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

export default GamepadOverlaySettingsForm;
