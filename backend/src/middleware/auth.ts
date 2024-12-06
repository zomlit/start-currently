import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

interface AuthStore {
  auth: {
    success: boolean;
    userId?: string;
    sessionId?: string;
    error?: string;
  };
}

export const clerkAuth = new Elysia().derive(async ({ request, store }) => {
  const token = request.headers.get("Authorization")?.split(" ")[1];

  logger.debug("Auth token:", {
    hasToken: !!token,
    tokenStart: token?.slice(0, 10),
  });

  if (!token) {
    logger.warn("No token provided in the request");
    (store as AuthStore).auth = { success: false, error: "No token provided" };
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.CLERK_JWT_VERIFICATION_KEY || ""
    );
    logger.debug("Token verified successfully:", {
      sub: (decoded as any).sub,
      sid: (decoded as any).sid,
    });

    (store as AuthStore).auth = {
      success: true,
      userId: (decoded as any).sub,
      sessionId: (decoded as any).sid,
    };
  } catch (error) {
    logger.error("Token verification failed:", {
      error: error instanceof Error ? error.message : String(error),
      token: token.slice(0, 10),
    });
    (store as AuthStore).auth = { success: false, error: "Invalid token" };
  }
});
