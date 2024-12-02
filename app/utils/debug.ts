import React from "react";

const styles = {
  base: "font-weight: bold; padding: 2px 5px; border-radius: 3px; margin: 0 2px;",
  timestamp: "color: #666; font-style: italic;",
  label: "background: #1e293b; color: #fff;",
  success: "background: #4ade80; color: #052e16;", // green
  warning: "background: #fbbf24; color: #451a03;", // yellow
  error: "background: #f87171; color: #450a0a;", // red
  info: "background: #60a5fa; color: #172554;", // blue
  highlight: "background: #a78bfa; color: #2e1065;", // purple
  groupTitle: "font-size: 12px; color: #666; font-weight: normal;",
} as const;

const createColoredLog =
  (style: string) =>
  (message: string, ...args: any[]) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `%c[${timestamp}]%c[Compiler]%c ${message}`,
      styles.timestamp,
      `${styles.base} ${styles.label}`,
      `${styles.base} ${style}`,
      ...args
    );
  };

const createGroupLog = (title: string, collapsed = false) => {
  const timestamp = new Date().toLocaleTimeString();
  const groupFn = collapsed ? console.groupCollapsed : console.group;
  groupFn(
    `%c[${timestamp}]%c[Compiler]%c ${title}`,
    styles.timestamp,
    `${styles.base} ${styles.label}`,
    styles.groupTitle
  );
};

export const compilerLog = {
  info: createColoredLog(styles.info),
  success: createColoredLog(styles.success),
  warning: createColoredLog(styles.warning),
  error: createColoredLog(styles.error),
  highlight: createColoredLog(styles.highlight),
  group: createGroupLog,
  groupCollapsed: (title: string) => createGroupLog(title, true),
  groupEnd: console.groupEnd,
  divider: () => console.log("\n"),
};

export const debugComponent = (componentName: string) => {
  if (process.env.NODE_ENV === "development") {
    const fiber = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
      ?.getFiberRoots()
      ?.values()
      ?.next()?.value;

    if (fiber?.current) {
      const fiberNode = fiber.current;
      const isOptimized = fiberNode._compiler || fiberNode._optimized;

      compilerLog.groupCollapsed(`Component: ${componentName}`);

      if (isOptimized) {
        compilerLog.success(`✨ Component is optimized`);
      } else {
        compilerLog.warning(`⚠️ Component is not optimized`);
      }

      compilerLog.info("Fiber details:", {
        memoizedState: fiberNode.memoizedState,
        flags: fiberNode.flags,
        mode: fiberNode.mode,
        _compiler: fiberNode._compiler,
        _optimized: fiberNode._optimized,
        _features: fiberNode._features,
      });

      compilerLog.highlight(
        `Runtime: ${React?.version} ${
          (window as any).__REACT_COMPILER_RUNTIME__ ? "✅" : "❌"
        }`
      );

      compilerLog.groupEnd();
      compilerLog.divider();
    }
  }
};

export type CompilerLog = typeof compilerLog;
