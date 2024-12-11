import { Elysia } from "elysia";
import { visualizerRoutes } from "./routes/visualizer";
import { auth } from "./middleware/auth";

const app = new Elysia().use(auth).use(visualizerRoutes).listen(9001);

export type App = typeof app;
