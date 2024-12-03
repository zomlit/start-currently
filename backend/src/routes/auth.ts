import { Elysia, t } from "elysia";

const auth = new Elysia().post(
  "/auth/login",
  async ({ body }) => {
    // Login logic here
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: {
      summary: "User Login",
      tags: ["Auth"],
    },
  }
);
// Add other auth routes here

export default auth;
