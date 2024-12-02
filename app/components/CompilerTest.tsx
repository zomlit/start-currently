import React from "react";
import { compilerLog } from "@/utils/debug";

// This will be optimized by the compiler
const ExpensiveCalculation = React.memo(({ value }: { value: number }) => {
  // This should be optimized and computed at compile time
  const result = React.useMemo(() => {
    compilerLog.groupCollapsed(`📊 ExpensiveCalculation`);
    compilerLog.info(`Input value: ${value.toLocaleString()}`);
    const startTime = performance.now();

    const result = Array(value)
      .fill(0)
      .reduce((acc) => acc + Math.random(), 0);

    const duration = performance.now() - startTime;
    compilerLog.highlight(
      `⚡ Computation completed in ${duration.toFixed(2)}ms`
    );
    compilerLog.groupEnd();
    compilerLog.divider();

    return result;
  }, [value]);

  return <div>Result: {result.toFixed(2)}</div>;
});

ExpensiveCalculation.displayName = "ExpensiveCalculation";

export const CompilerTest = () => {
  const [count, setCount] = React.useState(1000);

  React.useEffect(() => {
    compilerLog.group(`🧪 CompilerTest`);
    compilerLog.highlight(`Component mounted`);
    compilerLog.info(`Initial count: ${count.toLocaleString()}`);
    compilerLog.groupEnd();
    compilerLog.divider();
  }, [count]);

  return (
    <div className="p-4 border rounded">
      <h2>Compiler Test</h2>
      <button
        onClick={() => {
          setCount((c) => {
            const newCount = c + 1000;
            compilerLog.success(
              `🔄 Count updated: ${c.toLocaleString()} → ${newCount.toLocaleString()}`
            );
            return newCount;
          });
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add 1000
      </button>
      <ExpensiveCalculation value={count} />
    </div>
  );
};
