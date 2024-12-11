import { z } from "zod";

export const visualizerProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  userId: z.string(),
  settings: z.object({
    visual: z.object({
      // ... (same schema as before)
    }),
    functional: z.object({
      // ... (same schema as before)
    }),
  }),
});

export type VisualizerProfile = z.infer<typeof visualizerProfileSchema>;
