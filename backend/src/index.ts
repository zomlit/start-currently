import { Context, Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { html } from "@elysiajs/html";
import { serverTiming } from "@elysiajs/server-timing";
import { staticPlugin } from "@elysiajs/static";
import { cors } from "@elysiajs/cors";
import routes from "./routes"; // This should now work correctly
import { prisma } from "./db";
import { createSocketIOServer } from "./socketAdapter";
import logger from "./utils/logger";
import { initializeSocketIO, setIO } from "./socket";
import { resumeActiveSessions } from "./services/spotify.service";
import jwt from "jsonwebtoken";
import { validateBackendEnv } from "@currently/shared";
import { app } from "./app";

// Validate backend environment variables
const env = validateBackendEnv(process.env);

// Add these lines after the imports and before the app definition
let apiHitCount = 0;
let lastResetTime = Date.now();

// Add this function at the top of the file, after the imports
const getColorCode = (count: number): string => {
  if (count < 60) return "\x1b[32m"; // Green for < 60
  if (count < 120) return "\x1b[33m"; // Yellow for < 120
  return "\x1b[31m"; // Red for >= 120
};

// Ensure CLERK_JWT_VERIFICATION_KEY is set
if (!process.env.CLERK_JWT_VERIFICATION_KEY) {
  logger.error(
    "CLERK_JWT_VERIFICATION_KEY is not set in the environment variables"
  );
  process.exit(1);
}

// Add this function at the top level
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

const app = new Elysia()
  // .use(
  //   staticPlugin({
  //     assets: "public", // This will serve files from the public directory
  //     prefix: "/", // Serve at root path
  //   })
  // )
  .use(
    cors({
      origin: (origin) => {
        const allowedOrigins = [
          "http://localhost:3000",
          "https://livestreaming.tools",
          "https://www.livestreaming.tools",
          "https://lstio.livestreaming.tools",
        ];
        return typeof origin === "string"
          ? allowedOrigins.includes(origin as string) ||
              (origin as string).startsWith("http://localhost")
          : true;
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
      credentials: true,
    })
  )
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Currently API",
          version: "1.0.0",
        },
        tags: [
          { name: "Spotify", description: "Spotify integration endpoints" },
          { name: "Session", description: "Session management endpoints" },
        ],
        servers: [
          {
            url: "",
            description: "API server",
          },
        ],
      },
    })
  )
  .use(routes)
  .use(html())
  .use(serverTiming())
  .derive(async ({ headers, request }) => {
    const token = headers.authorization?.split(" ")[1];

    // Safely parse and redact URL
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

      // Decode without verification first to check expiration
      const decodedNoVerify = jwt.decode(token);
      const currentTime = Math.floor(Date.now() / 1000);

      logger.info("Token timing details", {
        exp: (decodedNoVerify as any)?.exp,
        iat: (decodedNoVerify as any)?.iat,
        currentTime,
        tokenAge: (decodedNoVerify as any)?.iat
          ? currentTime - (decodedNoVerify as any).iat
          : "unknown",
        tokenLifetime:
          (decodedNoVerify as any)?.exp - (decodedNoVerify as any)?.iat,
        timeUntilExpiry: (decodedNoVerify as any)?.exp - currentTime,
      });

      // If token is within 5 seconds of expiring, warn in logs
      if ((decodedNoVerify as any)?.exp - currentTime < 5) {
        logger.warn("Token critically close to expiration", {
          timeUntilExpiry: (decodedNoVerify as any)?.exp - currentTime,
          tokenLifetime:
            (decodedNoVerify as any)?.exp - (decodedNoVerify as any)?.iat,
          path: redactedUrl.toString(),
        });
      }

      const decoded = jwt.verify(token, verificationKey);
      await updateUserActivity((decoded as any).sub);

      // After successful verification, we should update user's active status
      logger.info("Token verification successful", {
        userId: (decoded as any).sub,
        sessionId: (decoded as any).sid,
        tokenLifetime: (decoded as any).exp - (decoded as any).iat,
        timeUntilExpiry: (decoded as any).exp - currentTime,
      });

      return {
        auth: {
          success: true,
          userId: (decoded as any).sub,
          sessionId: (decoded as any).sid,
        },
      };
    } catch (error) {
      // Enhanced error logging for expiration
      if (error instanceof jwt.TokenExpiredError) {
        logger.error("Token expired", {
          expiredAt: (error as any).expiredAt,
          currentTime: new Date().toISOString(),
          timeSinceExpiry: Math.floor(
            (Date.now() - (error as any).expiredAt.getTime()) / 1000
          ),
          path: redactedUrl.toString(),
        });
      } else {
        logger.error("Token verification failed:", {
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : "Unknown error",
          path: redactedUrl.toString(),
        });
      }

      return { auth: { success: false, error: "Invalid token" } };
    }
  })
  .onError(({ error, request, set }) => {
    // Get request details
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    if (error.message === "NOT_FOUND") {
      logger.error("Route not found:", {
        method,
        path,
      });

      set.status = 404;
      return {
        success: false,
        error: "Endpoint not found",
        path,
        availableRoutes: app.routes
          .filter((r) => !r.path.includes("*"))
          .map((r) => ({
            method: r.method,
            path: r.path,
          })),
      };
    }

    // Log other errors
    logger.error("Application error:", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      request: {
        method,
        path,
      },
    });

    set.status = "status" in error ? (error as any).status : 500;
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined,
    };
  })
  .get("/favicon.ico", () => new Response(null, { status: 204 }));

const { httpServer, io } = createSocketIOServer(app as any);
setIO(io);

// Add logging for Socket.IO connections
io.use((socket, next) => {
  // You can add more authentication logic here if needed
  next();
});

initializeSocketIO(httpServer);

// Expose a function to increment the API hit count and emit the update
export function incrementApiHitCount() {
  apiHitCount++;
  const now = Date.now();
  const timeSinceLastReset = now - lastResetTime;

  io.emit("spotifyApiStats", {
    apiHits: apiHitCount,
    timestamp: new Date().toISOString(),
    timeSinceLastReset,
  });

  const colorCode = getColorCode(apiHitCount);
  logger.info(
    `Spotify API hit: ${colorCode}${apiHitCount}\x1b[0m in the last ${Math.floor(
      timeSinceLastReset / 1000
    )} seconds`
  );
}

// Reset the counter every minute
setInterval(() => {
  const colorCode = getColorCode(apiHitCount);
  apiHitCount = 0;
  lastResetTime = Date.now();

  const userId = "defaultUserId";
  io.to(userId).emit("spotifyApiStatsReset", {
    apiHitCount,
    lastResetTime,
  });
}, 60000);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

export const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info("🗄️ Database was connected!");

    await resumeActiveSessions();

    const port = parseInt(process.env.PORT || "9001");
    httpServer.listen(port, () => {
      logger.info(`🦊 Server started at http://localhost:${port}`);
      logger.info(
        `Socket.IO server should be available at ws://localhost:${port}`
      );
    });

    httpServer.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        logger.error(
          `Port ${port} is already in use. Please choose a different port or close the application using this port.`
        );
        process.exit(1);
      } else {
        logger.error("An error occurred while starting the server:", {
          error: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
    });
  } catch (error) {
    logger.error("Failed to start the server:", {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    process.exit(1);
  }
};

export default app;
export type App = typeof app;
