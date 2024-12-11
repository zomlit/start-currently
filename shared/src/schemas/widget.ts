import { z } from "zod";

export const baseWidgetProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  isDefault: z.boolean().default(false),
  userId: z.string(),
  widgetType: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type BaseWidgetProfile = z.infer<typeof baseWidgetProfileSchema>;

// Helper to create widget-specific schemas
export function createWidgetSchema<T extends z.ZodType>(settingsSchema: T) {
  return baseWidgetProfileSchema.extend({
    settings: settingsSchema,
  });
}
