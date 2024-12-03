import { Elysia } from "elysia";
import spotify from "./routes/spotify";
import session from "./routes/session";
import healthRoutes from "./routes/health-check";
import twitchRoutes from "./routes/twitch";
import userCommandsRoutes from "./routes/user-commands";
import twitchChatDataRoutes from "./routes/twitch-chat-data";
import userDataRoutes from "./routes/user-data";
import rocketLeagueRoutes from "./routes/rocketLeague";
import bracketRoutes from "./routes/bracket";
import bracketsRoutes from "./routes/brackets";
import userTokensRoute from "./routes/user-tokens";
import { profileRoutes } from "./routes/profile";

const routes = new Elysia()
  .group("/health-check", (app) => app.use(healthRoutes))
  .group("/api", (app) =>
    app
      .group("/spotify", (app) => app.use(spotify))
      .group("/session", (app) => app.use(session))
      .group("/twitch", (app) => app.use(twitchRoutes))
      .group("/user-commands", (app) => app.use(userCommandsRoutes))
      .group("/twitch-chat", (app) => app.use(twitchChatDataRoutes))
      .group("/user", (app) => app.use(userDataRoutes))
      .group("/rocket-league", (app) => app.use(rocketLeagueRoutes))
      .group("/bracket", (app) => app.use(bracketRoutes))
      .group("/brackets", (app) => app.use(bracketsRoutes))
      .use(userTokensRoute)
      .use(profileRoutes)
  );

export default routes;
