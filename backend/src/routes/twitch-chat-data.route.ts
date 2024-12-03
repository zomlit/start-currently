import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const twitchChatDataRoute = new Elysia()
  .post("/twitch-chat-data", async ({ body }) => {
    const data = await prisma.twitch_chat_data.create({ data: body });
    return { success: true, data };
  }, {
    body: t.Object({
      user_id: t.String(),
      srEnabled: t.Optional(t.Boolean()),
      srAnnounceMessages: t.Optional(t.Boolean()),
      selectedUsername: t.Optional(t.String()),
      message: t.Optional(t.String()),
      queueCommand: t.Optional(t.String()),
      songRequestCommand: t.Optional(t.String()),
      skipCommand: t.Optional(t.String()),
      token: t.Optional(t.String()),
      showAvatars: t.Optional(t.Boolean()),
      // Add other fields as needed
    })
  })
  .get("/twitch-chat-data/:userId", async ({ params }) => {
    const data = await prisma.twitch_chat_data.findUnique({
      where: { user_id: params.userId }
    });
    return { success: true, data };
  })
  .put("/twitch-chat-data/:userId", async ({ params, body }) => {
    const data = await prisma.twitch_chat_data.update({
      where: { user_id: params.userId },
      data: body
    });
    return { success: true, data };
  }, {
    body: t.Partial(t.Object({
      srEnabled: t.Boolean(),
      srAnnounceMessages: t.Boolean(),
      selectedUsername: t.String(),
      message: t.String(),
      queueCommand: t.String(),
      songRequestCommand: t.String(),
      skipCommand: t.String(),
      token: t.String(),
      showAvatars: t.Boolean(),
      // Add other fields as needed
    }))
  });

export default twitchChatDataRoute;