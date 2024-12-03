import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { defaultSettings } from "@/utils/defaultSettings";

const gameStatsSettingsSchema = z.object({
  game: z.string().min(1),
  selectedStats: z.array(z.string()),
});

type GameStatsSettings = z.infer<typeof gameStatsSettingsSchema>;

type GameStatsSettingsFormProps = {
  specificSettings: Partial<GameStatsSettings>;
  onSettingsChange: (newSettings: Partial<GameStatsSettings>) => void;
};

const GameStatsSettingsForm: React.FC<GameStatsSettingsFormProps> = ({
  specificSettings,
  onSettingsChange,
}) => {
  const form = useForm<GameStatsSettings>({
    resolver: zodResolver(gameStatsSettingsSchema),
    defaultValues: {
      game: specificSettings?.game || defaultSettings["game-stats"].game,
      selectedStats: specificSettings?.selectedStats || defaultSettings["game-stats"].selectedStats,
    },
  });

  const onSubmit = (values: GameStatsSettings) => {
    onSettingsChange(values);
  };

  const availableStats = ["kills", "deaths", "assists", "score", "time"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="game"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="selectedStats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selected Stats</FormLabel>
              <div className="space-y-2">
                {availableStats.map((stat) => (
                  <Checkbox
                    key={stat}
                    checked={(field.value || []).includes(stat)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...(field.value || []), stat]
                        : (field.value || []).filter((s) => s !== stat);
                      field.onChange(newValue);
                      onSettingsChange({ selectedStats: newValue });
                    }}
                  >
                    {stat}
                  </Checkbox>
                ))}
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default GameStatsSettingsForm;
