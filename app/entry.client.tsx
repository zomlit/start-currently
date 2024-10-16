import { StartClient } from "@tanstack/start";
import { createRouter } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";

const router = createRouter();
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StartClient router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
