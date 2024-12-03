/// <reference types="vinxi/types/client" />
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/start";
import { createRouter } from "./router";
import { HydrationErrorBoundary } from "./components/HydrationErrorBoundary";

const router = createRouter();

// Wrap hydration in a try-catch
try {
  hydrateRoot(
    document!,
    <HydrationErrorBoundary>
      <StartClient router={router} />
    </HydrationErrorBoundary>
  );
} catch (error) {
  console.error("Hydration failed:", error);
  // Force a client-side only render if hydration fails
  if (error instanceof Error && error.message.includes("JSON")) {
    window.location.reload();
  }
}
