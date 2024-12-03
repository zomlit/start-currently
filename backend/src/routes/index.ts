import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import spotify from "./spotify";
import session from "./session";

const apiRoutes = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Currently API",
          version: "1.0.0",
        },
        tags: [
          { name: "Spotify", description: "Spotify integration endpoints" },
          { name: "Session", description: "Session management endpoints" },
        ],
      },
      path: "/docs",
    })
  )
  .group("/api", (app) =>
    app
      .group("/spotify", (app) => app.use(spotify))
      .group("/session", (app) => app.use(session))
  );

export default apiRoutes;
