import { Elysia } from "elysia";
import { clerkClient } from "@clerk/clerk-sdk-node";

const userTokensRoute = new Elysia().group("/user-tokens", (app) =>
  app.get("/:userId", async ({ params }) => {
    const { userId } = params;

    if (!userId) {
      return { success: false, message: "User ID is required" };
    }

    try {
      const user = await clerkClient.users.getUser(userId);

      if (!user) {
        return { success: false, message: "User not found" };
      }

      const externalAccounts = user.externalAccounts || [];

      const provider = "oauth_twitch";
      const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
        userId,
        provider
      );

      // Check if clerkResponse is an array
      const tokenInfoArray = Array.isArray(clerkResponse)
        ? clerkResponse
        : clerkResponse.data || [];

      const matchedTokens = tokenInfoArray
        .map((tokenInfo: any) => {
          const matchedAccount = externalAccounts.find(
            (account) => account.id === tokenInfo.externalAccountId
          );

          if (matchedAccount) {
            return {
              avatar: matchedAccount.imageUrl,
              label: matchedAccount.username,
              value: matchedAccount.firstName,
              providerUserId: matchedAccount.id,
              token: tokenInfo.token,
              externalId: matchedAccount.externalId,
            };
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      return { success: true, matchedTokens };
    } catch (error) {
      console.error("Error fetching user tokens:", error);
      return { success: false, message: "Failed to fetch user tokens" };
    }
  })
);

export default userTokensRoute;
