import { Elysia } from "elysia";
import { verifyToken } from "@clerk/backend";

type AuthStore = {
  auth: {
    success: boolean;
    userId?: string;
    error?: string;
  };
};

export const auth = new Elysia().derive(
  async ({ request, set }): Promise<AuthStore> => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { auth: { success: false, error: "No token provided" } };
    }

    const token = authHeader.split(" ")[1];
    try {
      const claims = await verifyToken(token);
      return {
        auth: {
          success: true,
          userId: claims.sub,
        },
      };
    } catch (error) {
      set.status = 401;
      return { auth: { success: false, error: "Invalid token" } };
    }
  }
);
