/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean; // Add this line
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
