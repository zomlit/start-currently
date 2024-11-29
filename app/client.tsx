/// <reference types="vinxi/types/client" />
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/start";
import { createRouter } from "./router";
import { HydrationErrorBoundary } from "./components/HydrationErrorBoundary";

const router = createRouter();

hydrateRoot(
  document!,
  <HydrationErrorBoundary>
    <StartClient router={router} />
  </HydrationErrorBoundary>
);
