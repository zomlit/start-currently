import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth";

export default (app: Elysia) =>
  app
    .get("/session", async ({ set, jwt }) => {
      const token = await jwt.sign({ sessionData: "example" });
      return { message: "Session created", token };
    })
    .get("/docs", () => {
      return { message: "API Documentation" };
    })
    .group("/protected", (app) =>
      app.use(authMiddleware).get("/user", async ({ userId }) => {
        // Here you would typically fetch user data from your database
        return { userId, message: "Protected user data" };
      })
    );
