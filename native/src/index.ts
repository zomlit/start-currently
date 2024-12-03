import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { lyricsRoutes } from "./routes/lyrics";

const app = new Elysia()
  .use(
    cors({
      origin: (origin) => {
        return typeof origin === "string"
          ? [
              "http://localhost:3000",
              "https://livestreaming.tools",
              "https://www.livestreaming.tools",
              "https://lstio.livestreaming.tools",
            ].includes(origin) || origin.startsWith("http://localhost")
          : true;
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Livestreaming Tools API",
          version: "1.0.0",
        },
      },
      path: "/docs",
    })
  )
  .use(lyricsRoutes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  console.log("Swagger documentation available at http://localhost:3000/docs");
});
