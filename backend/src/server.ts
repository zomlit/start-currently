import { Elysia } from "elysia";
import { startServer } from "./index";

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
