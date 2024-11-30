import { z } from "zod";

export const lyricsSchema = z.object({
  backgroundColor: z.string(),
  padding: z.number(),
  fontFamily: z.string(),
  fontSize: z.number(),
  textColor: z.string(),
  lineHeight: z.number(),
  textAlign: z.enum(["left", "center", "right"]),
  // ... add other fields as needed
});

export type LyricsSettings = z.infer<typeof lyricsSchema>;
