import type { CompilerOptions } from "react-compiler-runtime";

// Initialize compiler options before React loads
if (typeof window !== "undefined") {
  const compilerOptions: CompilerOptions = {
    development: process.env.NODE_ENV === "development",
    experimental: true,
    optimize: true,
    features: {
      compiler: true,
      memoization: true,
      inlineStyles: true,
      constantFolding: true,
      deadCodeElimination: true,
    },
    runtime: {
      auto: true,
    },
  };

  // Set compiler options
  Object.defineProperty(window, "__REACT_COMPILER_OPTIONS__", {
    value: compilerOptions,
    enumerable: true,
    configurable: false,
  });

  // Enable compiler features
  Object.defineProperty(window, "__REACT_COMPILER_RUNTIME__", {
    value: true,
    enumerable: true,
    configurable: false,
  });
}
