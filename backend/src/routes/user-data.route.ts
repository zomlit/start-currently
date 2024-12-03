import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userDataRoute = new Elysia()
  .post(
    "/user-data",
    async ({ body }) => {
      const data = await prisma.UserProfile.create({ data: body });
      return { success: true, data };
    },
    {
      body: t.Object({
        user_id: t.String(),
        spotifyToken: t.Optional(t.String()),
        twitchToken: t.Optional(t.String()),
        broadcastId: t.Optional(t.String()),
        selectedUsername: t.Optional(t.String()),
        tokens: t.Optional(t.Any()),
        streamelements_jwt: t.Optional(t.String()),
        s_client_id: t.Optional(t.String()),
        s_client_secret: t.Optional(t.String()),
        // Add other fields as needed
      }),
    }
  )
  .get("/user-data/:userId", async ({ params }) => {
    const data = await prisma.UserProfile.findUnique({
      where: { user_id: params.userId },
    });
    return { success: true, data };
  })
  .put(
    "/user-data/:userId",
    async ({ params, body }) => {
      const data = await prisma.UserProfile.update({
        where: { user_id: params.userId },
        data: body,
      });
      return { success: true, data };
    },
    {
      body: t.Partial(
        t.Object({
          spotifyToken: t.String(),
          twitchToken: t.String(),
          broadcastId: t.String(),
          selectedUsername: t.String(),
          tokens: t.Any(),
          streamelements_jwt: t.String(),
          s_client_id: t.String(),
          s_client_secret: t.String(),
          // Add other fields as needed
        })
      ),
    }
  );

export default userDataRoute;
