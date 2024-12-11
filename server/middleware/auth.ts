import { Elysia } from "elysia";
import { clerk } from "../lib/clerk";

export const auth = new Elysia().derive(async ({ request }) => {
  const session = await clerk.authenticateRequest(request);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return {
    user: {
      id: session.userId,
      // Add other user properties as needed
    },
  };
});
