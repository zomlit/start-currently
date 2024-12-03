import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

export const clerkAuth = new Elysia().derive(async ({ request }) => {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    logger.warn("No token provided in the request");
    return { auth: { success: false, error: "No token provided" } };
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.CLERK_JWT_VERIFICATION_KEY || ""
    );
    logger.info("Token verified successfully:", decoded);
    return {
      auth: {
        success: true,
        userId: (decoded as any).sub,
        sessionId: (decoded as any).sid,
      },
    };
  } catch (error) {
    logger.error("Token verification failed:", error);
    return { auth: { success: false, error: "Invalid token" } };
  }
});
