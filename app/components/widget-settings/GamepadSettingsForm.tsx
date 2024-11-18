import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { CONTROLLER_TYPES, CONTROLLER_COLORS } from "@/lib/gamepad-settings";
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

const gamepadSettingsSchema = z.object({
  controllerType: z.string(),
  controllerColor: z.string(),
  // ... other settings
});

type GamepadSettingsFormProps = {
  settings: z.infer<typeof gamepadSettingsSchema>;
  onSettingsChange: (
    settings: Partial<z.infer<typeof gamepadSettingsSchema>>
  ) => void;
};

export function GamepadSettingsForm({
  settings,
  onSettingsChange,
}: GamepadSettingsFormProps) {
  const form = useForm<z.infer<typeof gamepadSettingsSchema>>({
    resolver: zodResolver(gamepadSettingsSchema),
    defaultValues: settings,
  });

  // Update form when settings change
  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  return (
    <Form {...form}>
      <form className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="controllerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Controller Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a controller type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTROLLER_TYPES.map((controller) => {
                    const Icon = controller.icon;
                    return (
                      <SelectItem
                        key={controller.id}
                        value={controller.id}
                        className="flex items-center space-x-2"
                        disabled={controller.disabled}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{controller.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose your controller type for accurate button mapping
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="controllerColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Controller Color</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTROLLER_COLORS.map((color) => (
                    <SelectItem
                      key={color.id}
                      value={color.id}
                      className="flex items-center space-x-2"
                    >
                      <div className="flex items-center space-x-2">
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
              <FormDescription>
                Choose your controller's color scheme
              </FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
