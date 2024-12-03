import "@elysiajs/elysia";

declare module "@elysiajs/elysia" {
  interface ElysiaContext {
    auth?: {
      success: boolean;
      userId: string;
    };
  }
}
