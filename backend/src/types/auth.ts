import { Elysia } from "elysia";

export interface Auth {
  success: boolean;
  userId?: string;
  sessionId?: string;
  error?: string;
}

export interface AuthStore {
  auth: Auth;
}

// Create auth service following Elysia's best practices
export const createAuthService = () =>
  new Elysia({ name: "auth-service" })
    .derive(({ store }) => ({
      Auth: {
        user: (store as AuthStore).auth?.userId,
        success: (store as AuthStore).auth?.success,
        sessionId: (store as AuthStore).auth?.sessionId,
      },
    }))
    .guard({
      beforeHandle: ({ Auth, set }) => {
        if (!Auth?.user || !Auth.success) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
      },
    });

declare module "elysia" {
  interface ElysiaStore {
    auth?: {
      success: boolean;
      userId?: string;
      sessionId?: string;
      error?: string;
    };
  }
}
