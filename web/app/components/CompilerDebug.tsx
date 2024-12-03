import React from "react";
import { compilerDebug } from "@/utils/compiler-debug";

export const CompilerDebug = () => {
  React.useEffect(() => {
    // Check if compiler is enabled
    const isCompilerEnabled = process.env.REACT_COMPILER === "true";
    const hasCompilerRuntime = !!(window as any).__REACT_COMPILER_RUNTIME__;
    const compilerOptions = (window as any).__REACT_COMPILER_OPTIONS__;

    compilerDebug.log("Initializing compiler debug...");
    compilerDebug.info(`React Version: ${React.version}`);
    compilerDebug.info(`Compiler Enabled: ${isCompilerEnabled}`);
    compilerDebug.info(`Compiler Runtime: ${hasCompilerRuntime}`);

    if (compilerOptions) {
      compilerDebug.success("Compiler options found:", compilerOptions);
    } else {
      compilerDebug.warning("No compiler options detected");
    }

    // Check if component is optimized
    const fiber = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      ?.getFiberRoots()
      ?.values()
      ?.next()?.value;

    if (fiber?.current) {
      const isOptimized = fiber.current._compiler || fiber.current._optimized;
      if (isOptimized) {
        compilerDebug.success("Component is optimized by compiler ✨");
      } else {
        compilerDebug.warning("Component is not optimized");
      }
    }
  }, []);

  // Test memoization
  const expensiveCalculation = React.useMemo(() => {
    compilerDebug.info("Running expensive calculation...");
    return Array(1000)
      .fill(0)
      .reduce((acc) => acc + Math.random(), 0);
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Compiler Debug</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Check the console for compiler debug information
      </p>
      <div className="mt-2 text-sm font-mono">
        Result: {expensiveCalculation.toFixed(2)}
      </div>
    </div>
  );
};
