import { Server } from "socket.io";
import { Elysia } from "elysia";
import http from "http";

let io: Server | null = null;

export function createSocketIOServer(app: Elysia) {
  const httpServer = http.createServer((req, res) => {
    if (!req.url || !req.headers.host) {
      res.writeHead(400);
      res.end("Invalid request");
      return;
    }

    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const request = new Request(url.toString(), {
        method: req.method,
        headers: new Headers(req.headers as any),
      });

      app
        .handle(request)
        .then((response) => {
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          return response.arrayBuffer();
        })
        .then((body) => {
          res.end(Buffer.from(body));
        })
        .catch((error) => {
          console.error("Error handling request:", error);
          res.statusCode = 500;
          res.end("Internal Server Error");
        });
    } catch (error) {
      res.writeHead(400);
      res.end("Invalid URL");
      return;
    }
  });

  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    allowEIO3: true,
    connectTimeout: 45000,
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return { httpServer, io };
}

export function getIO(): Server | null {
  return io;
}
