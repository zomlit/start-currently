import { Elysia, t } from "elysia";
import { prisma } from "../../db";
import logger from "../../utils/logger";
import { createAuthService } from "../../types/auth";

export default (app: Elysia) =>
  app.use(createAuthService()).get(
    "/:userId",
    async ({ params, set }) => {
      const { userId } = params;
      logger.info(`Fetching tokens for user: ${userId}`);

      if (!userId) {
        set.status = 400;
        return { error: "User ID is required" };
      }

      try {
        // Fetch user's Twitch tokens from database
        const userProfile = await prisma.userProfile.findUnique({
          where: { user_id: userId },
          select: {
            twitch_tokens: true,
          },
        });

        logger.info(`Found user profile: ${!!userProfile}`);

        if (!userProfile?.twitch_tokens) {
          return {
            matchedTokens: [],
          };
        }

        // Transform tokens into expected format
        const tokens = userProfile.twitch_tokens as any;
        const matchedTokens = Array.isArray(tokens) ? tokens : [];

        logger.info(`Found ${matchedTokens.length} tokens`);

        return {
          matchedTokens: matchedTokens.map((token: any) => ({
            avatar: token.avatar || "",
            label: token.label || token.username || "",
            value: token.value || token.id || "",
            providerUserId: token.providerUserId || token.id || "",
            externalId: token.externalId || token.id || "",
            token: token.token || token.accessToken || "",
            refreshToken: token.refreshToken || "",
          })),
        };
      } catch (error) {
        logger.error("Error fetching user tokens:", error);
        set.status = 500;
        return { error: "Failed to fetch user tokens" };
      }
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      detail: {
        tags: ["User"],
        summary: "Get User Twitch Tokens",
        description: "Get Twitch tokens for a specific user",
      },
    }
  );
