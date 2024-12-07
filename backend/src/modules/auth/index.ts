import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import { prisma } from "../../db";
import logger from "../../utils/logger";
import { getIO } from "../../socketAdapter";

let apiHitCount = 0;
let lastResetTime = Date.now();

const getColorCode = (count: number): string => {
  if (count < 60) return "\x1b[32m";
  if (count < 120) return "\x1b[33m";
  return "\x1b[31m";
};

const updateUserActivity = async (userId: string) => {
  try {
    await prisma.userProfile.update({
      where: { user_id: userId },
      data: {
        is_active: true,
        last_activity: new Date(),
      },
    });
  } catch (error) {
    logger.error(`Failed to update activity for user ${userId}:`, error);
  }
};

export const authMiddleware = new Elysia().derive(
  async ({ headers, request }) => {
    const token = headers.authorization?.split(" ")[1];
    const url = new URL(request.url);
    const redactedUrl = new URL(url.toString());

    // Redact sensitive parameters
    ["spotifyRefreshToken", "twitchAccessToken", "clerkSessionId"].forEach(
      (param) => {
        if (redactedUrl.searchParams.has(param)) {
          redactedUrl.searchParams.set(param, "[REDACTED]");
        }
      }
    );

    if (!token) {
      return { auth: { success: false, error: "No token provided" } };
    }

    try {
      const verificationKey = process.env.CLERK_JWT_VERIFICATION_KEY;
      if (!verificationKey) {
        throw new Error("CLERK_JWT_VERIFICATION_KEY is not set");
      }

      const decoded = jwt.verify(token, verificationKey);
      await updateUserActivity((decoded as any).sub);

      return {
        auth: {
          success: true,
          userId: (decoded as any).sub,
          sessionId: (decoded as any).sid,
        },
      };
    } catch (error) {
      logger.error("Token verification failed:", {
        error: error instanceof Error ? error.message : String(error),
        path: redactedUrl.toString(),
      });
      return { auth: { success: false, error: "Invalid token" } };
    }
  }
);

export function incrementApiHitCount() {
  apiHitCount++;
  const now = Date.now();
  const timeSinceLastReset = now - lastResetTime;

  const io = getIO();
  if (io) {
    io.emit("spotifyApiStats", {
      apiHits: apiHitCount,
      timestamp: new Date().toISOString(),
      timeSinceLastReset,
    });
  }

  const colorCode = getColorCode(apiHitCount);
  logger.info(
    `Spotify API hit: ${colorCode}${apiHitCount}\x1b[0m in the last ${Math.floor(
      timeSinceLastReset / 1000
    )} seconds`
  );
}

// Reset counter every minute
setInterval(() => {
  apiHitCount = 0;
  lastResetTime = Date.now();

  const io = getIO();
  if (io) {
    io.emit("spotifyApiStatsReset", {
      apiHitCount,
      lastResetTime,
    });
  }
}, 60000);
