/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly DEV: boolean; // Add this line
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
