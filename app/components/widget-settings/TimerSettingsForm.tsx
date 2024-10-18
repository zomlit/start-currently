import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const timerSettingsSchema = z.object({
  initialTime: z.number().min(0),
  countDirection: z.enum(["up", "down"]),
});

interface TimerSettingsFormProps {
  specificSettings: any; // Replace 'any' with the correct type for timer settings
  onSettingsChange: (newSettings: any) => void;
}

const TimerSettingsForm: React.FC<TimerSettingsFormProps> = ({
  specificSettings,
  onSettingsChange,
}) => {
  const form = useForm<z.infer<typeof timerSettingsSchema>>({
    resolver: zodResolver(timerSettingsSchema),
    defaultValues: specificSettings,
  });

  const onSubmit = (values: z.infer<typeof timerSettingsSchema>) => {
    onSettingsChange(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="initialTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Time (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="countDirection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Count Direction</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select count direction" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="up">Up</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default TimerSettingsForm;
