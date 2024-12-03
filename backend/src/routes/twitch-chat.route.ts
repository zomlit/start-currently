import { Elysia, t } from "elysia";
import { logger } from "@bogeychan/elysia-logger";
import { getUserInfo, sendChatMessage } from "../services/twitch-api.service";
import {
  addWebSocketConnection,
  removeWebSocketConnection,
} from "../services/twitch.service";

export default (app: Elysia) =>
  app.post(
    "/twitch-chat",
    async ({ body }) => {
      const { message, channelName } = body;

      try {
        const userInfo = await getUserInfo(channelName);
        if (!userInfo.data || userInfo.data.length === 0) {
          throw new Error(`Channel ${channelName} not found`);
        }

        const broadcasterId = userInfo.data[0].id;
        await sendChatMessage(broadcasterId, message);

        logger.info("Message sent to Twitch chat", { channelName, message });
        return { success: true, message: "Message sent to Twitch chat" };
      } catch (error) {
        logger.error("Error sending message to Twitch chat:", {
          error,
          channelName,
          message,
        });
        return {
          success: false,
          error: "Failed to send message to Twitch chat",
        };
      }
    },
    {
      body: t.Object({
        message: t.String(),
        channelName: t.String(),
      }),
    }
  );
