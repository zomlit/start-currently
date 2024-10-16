/// <reference types="vinxi/types/server" />
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/start/server";
import { getRouterManifest } from "@tanstack/start/router-manifest";
import { createClerkHandler } from "@clerk/tanstack-start/server";
import { createRouter } from "./router";

const handler = createStartHandler({
  createRouter,
  getRouterManifest,
});

const clerkHandler = createClerkHandler(handler);

export default async (req: Request, res: Response) => {
  const ReactDOMServer = await import("react-dom/server");
  return clerkHandler(defaultStreamHandler)(req, res);
};
