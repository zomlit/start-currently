import { Elysia } from "elysia";
import { startTwitchSession } from "../../services/twitch.service";
import { clerkPlugin } from "elysia-clerk";

export default (app: Elysia) =>
  app
    .use(clerkPlugin())
    .post("/start-session", async ({ body, set, auth, clerk }) => {
      console.log("Start session - Full context:", {
        body,
        set,
        headers: set.headers,
        auth,
      });

      if (!auth?.userId) {
        set.status = 401;
        return { error: "Unauthorized: User not authenticated" };
      }

      const { twitchChannel, twitchAccessToken } = body as {
        twitchChannel: string;
        twitchAccessToken: string;
      };

      if (!twitchChannel || !twitchAccessToken) {
        set.status = 400;
        return { error: "Invalid request body: Missing required fields" };
      }

      try {
        const sessionToken = await auth.getToken();
        const result = await startTwitchSession(
          auth.userId,
          twitchChannel,
          twitchAccessToken,
          sessionToken
        );

        return {
          success: true,
          message: result.message,
          userId: auth.userId,
          twitchChannel,
        };
      } catch (error) {
        console.error("Detailed error:", error);
        console.error({
          message: `Error starting Twitch session for user ${auth.userId}`,
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          body: JSON.stringify(body),
        });
        set.status = 500;
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to start Twitch session. Please try again.",
        };
      }
    });
