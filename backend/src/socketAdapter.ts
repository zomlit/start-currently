import { Server } from "socket.io";
import { createServer } from "http";

let io: Server | null = null;

export function createSocketIOServer(
  httpServer: ReturnType<typeof createServer>
) {
  if (io) {
    console.warn("Socket.IO server already initialized");
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}
