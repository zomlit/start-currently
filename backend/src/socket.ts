import { Server as SocketIOServer, Socket } from "socket.io";
import { Server } from "http";
import { clerkClient } from "@clerk/clerk-sdk-node";

let io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: Server) {
  if (io) {
    console.warn("Socket.IO is already initialized");
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication token is missing"));
    }

    try {
      const session = await clerkClient.sessions.verifySession(token);
      if (session) {
        (socket as any).session = session;
        next();
      } else {
        next(new Error("Invalid session"));
      }
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  console.log("Socket.IO server initialized");
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initializeSocketIO first."
    );
  }
  return io;
}

export function setIO(socketIO: SocketIOServer) {
  io = socketIO;
}
