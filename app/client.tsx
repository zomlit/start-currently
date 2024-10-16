// app/client.tsx
/// <reference types="vinxi/types/client" />
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/start";
import { createRouter } from "./router";

const router = createRouter();

const App = () => <StartClient router={router} />;

hydrateRoot(document.getElementById("root")!, <App />);

export default App;
