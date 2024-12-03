import { Elysia, t } from "elysia";

export const twitchRoutes = new Elysia({ prefix: "/twitch" }).get(
  "/user",
  async ({ query }) => {
    // Get Twitch user logic here
  },
  {
    query: t.Object({
      username: t.String(),
    }),
    detail: {
      summary: "Get Twitch User",
      tags: ["Twitch"],
    },
  }
);
// Add other Twitch routes here

export default twitchRoutes;
