import type { CompilerConfig } from "react-compiler-runtime";

// Define our own types since they're not exported
interface CompilerFeatures {
  memoization: boolean;
  inlineStyles: boolean;
  constantFolding: boolean;
  deadCodeElimination: boolean;
}

interface CompilerOptimizations {
  preset: "react-server";
  throwIfNotOptimized: boolean;
}

interface CompilerConfiguration {
  debug: boolean;
  verbose: boolean;
  runtime: boolean;
  optimize: CompilerOptimizations;
  features: CompilerFeatures;
}

export const compilerConfig: CompilerConfiguration = {
  debug: true,
  verbose: true,
  runtime: true,
  optimize: {
    preset: "react-server",
    throwIfNotOptimized: true,
  },
  features: {
    memoization: true,
    inlineStyles: true,
    constantFolding: true,
    deadCodeElimination: true,
  },
};

export default compilerConfig;
