import React from "react";
import { compilerLog } from "@/utils/debug";

export const CompilerVerification = () => {
  React.useEffect(() => {
    compilerLog.highlight("Verification component mounted");

    // Check compiler configuration
    const compilerConfig = (window as any).__REACT_COMPILER_OPTIONS__;
    compilerLog.info("Configuration:", compilerConfig);

    // Check React version and features
    compilerLog.highlight("React version:", React.version);
    compilerLog.info(
      "Experimental features:",
      !!process.env.REACT_EXPERIMENTAL
    );
    compilerLog.info("Compiler enabled:", !!process.env.REACT_COMPILER);

    // Check for compiler optimizations
    const fiber = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      ?.getFiberRoots()
      ?.values()
      ?.next()?.value;

    if (fiber?.current) {
      const fiberNode = fiber.current;
      const isOptimized = fiberNode._compiler || fiberNode._optimized;

      if (isOptimized) {
        compilerLog.success("Compiler optimizations detected ✨");
      } else {
        compilerLog.warning("No compiler optimizations detected");
      }

      compilerLog.info("Fiber root:", {
        memoizedState: fiberNode.memoizedState,
        flags: fiberNode.flags,
        mode: fiberNode.mode,
        _compiler: fiberNode._compiler,
        _optimized: fiberNode._optimized,
        _features: fiberNode._features,
      });
    }
  }, []);

  return null;
};
