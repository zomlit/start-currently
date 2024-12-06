import { z } from "zod";

export const chatSettingsSchema = z.object({
  broadcastChannel: z.string().min(1, "Broadcast channel is required"),
  selectedUsername: z.string().min(1, "Username is required"),
  selectedUsernameToken: z.string().optional(),
  showAvatars: z.boolean().default(true),
  showBadges: z.boolean().default(true),
  showPlatform: z.boolean().default(true),
  chatSkin: z.enum(["default", "compact", "bubble"]),
  chatBubbleColor: z.string(),
  maxHeight: z.number().min(100).max(2000),
});

export type ChatSettings = z.infer<typeof chatSettingsSchema>;
