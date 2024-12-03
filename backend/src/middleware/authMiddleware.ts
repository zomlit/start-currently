import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { Auth } from "../types/auth";

export const authMiddleware = new Elysia().derive(
  async ({ headers }): Promise<{ auth: Auth }> => {
    const token = headers.authorization?.split(" ")[1];

    if (!token) {
      return { auth: { success: false, error: "No token provided" } };
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.CLERK_JWT_VERIFICATION_KEY!
      );
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
  }
);
