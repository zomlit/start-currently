import { Elysia } from "elysia";
import logger from "../utils/logger";

export default (app: Elysia) =>
  app
    .get("/", ({ set }) => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };
    })
    .get("/ping", () => "pong");
