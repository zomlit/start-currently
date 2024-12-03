import { Elysia, t } from "elysia";
import logger from "../utils/logger";
import { fetchRocketLeagueData } from "../services/rocketLeague.service";

const rocketLeagueRoutes = new Elysia({ prefix: "/api" }).get(
  "/rocket-league",
  async ({ query }: { query: { platform: string; username: string } }) => {
    const { platform, username } = query;

    if (!platform || !username) {
      logger.warn(
        `Invalid request: Missing platform or username. Query: ${JSON.stringify(
          query
        )}`
      );
      return new Response(
        JSON.stringify({ error: "Platform and username are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const data = await fetchRocketLeagueData(platform, username);
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(
        `Error fetching Rocket League data: ${
          error instanceof Error ? error.stack : String(error)
        }`
      );
      return new Response(
        JSON.stringify({
          error: `Failed to fetch Rocket League data`,
          details: String(error),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
  {
    query: t.Object({
      platform: t.String(),
      username: t.String(),
    }),
    response: t.Any(),
    detail: {
      summary: "Fetch Rocket League Data",
      tags: ["Rocket League"],
    },
  }
);

export default rocketLeagueRoutes;
