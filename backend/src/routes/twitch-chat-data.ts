import { Elysia } from "elysia";
import { fetchTwitchChatDataById } from "../services/twitch-chat.service";

const twitchChatDataRoutes = new Elysia({
  prefix: "/api/twitch-chat-data",
}).get("/:id", async ({ params: { id } }) => {
  try {
    const chatData = await fetchTwitchChatDataById(id);
    return { success: true, data: chatData };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
});

export default twitchChatDataRoutes;
