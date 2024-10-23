import { z } from "zod";

export const WidgetTypeSchema = z.enum([
  "visualizer",
  "chat",
  "alerts",
  "game_stats",
  "game_overlay",
  "gamepad",
  "timer",
  "configure",
  "freeform",
]);

export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const CommonSettingsSchema = z.object({
  backgroundColor: z.string(),
  textColor: z.string(),
  // Add other common settings as needed
});

export const SpecificSettingsSchema = z
  .object({
    showAlbumArt: z.boolean().optional(),
    showPlaylist: z.boolean().optional(),
    // Add other specific settings as needed
  })
  .passthrough(); // Allow additional properties for different widget types

export const WidgetProfileSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    widgetType: WidgetTypeSchema,
    settings: z
      .object({
        commonSettings: CommonSettingsSchema.default({
          backgroundColor: "#000000",
          textColor: "#ffffff",
        }),
        specificSettings: SpecificSettingsSchema.default({}),
      })
      .default({}),
    color: z.string().default("#000000"),
    is_active: z.boolean().default(true),
    is_current: z.boolean().default(false),
    user_id: z.string(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .default({
    id: "",
    name: "",
    widgetType: "visualizer",
    settings: {
      commonSettings: {
        backgroundColor: "#000000",
        textColor: "#ffffff",
      },
      specificSettings: {},
    },
    color: "#000000",
    is_active: true,
    is_current: false,
    user_id: "",
  });

export type WidgetProfile = z.infer<typeof WidgetProfileSchema>;
