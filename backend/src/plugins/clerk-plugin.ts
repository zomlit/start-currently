import { Elysia } from "elysia";
import { clerkClient, ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import logger from "../utils/logger";

export const customClerkPlugin = new Elysia().derive(async ({ request }) => {
  const auth = ClerkExpressWithAuth();

  try {
    const result = await new Promise((resolve) => {
      auth(request as any, {} as any, (err: any) => {
        if (err) {
          resolve({ auth: null, error: err });
        } else {
          resolve({ auth: (request as any).auth, error: null });
        }
      });
    });

    if (result.error) {
      logger.warn(`Authentication error: ${result.error.message}`);
      return { auth: null, userId: null };
    }

    const userId = result.auth?.userId;
    return { auth: result.auth, userId };
  } catch (error) {
    logger.error(`Clerk authentication error: ${error.message}`);
    return { auth: null, userId: null };
  }
});
