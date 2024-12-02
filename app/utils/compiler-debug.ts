const styles = {
  base: "font-weight: bold; padding: 2px 5px; border-radius: 3px;",
  compiler: "background: #8b5cf6; color: white;", // violet-500
  success: "background: #22c55e; color: white;", // green-500
  warning: "background: #f59e0b; color: white;", // amber-500
  error: "background: #ef4444; color: white;", // red-500
  info: "background: #3b82f6; color: white;", // blue-500
} as const;

export const compilerDebug = {
  log: (message: string, ...args: any[]) => {
    console.log(
      `%c[Compiler]%c ${message}`,
      `${styles.base} ${styles.compiler}`,
      "",
      ...args
    );
  },
  success: (message: string, ...args: any[]) => {
    console.log(
      `%c[Compiler]%c ${message}`,
      `${styles.base} ${styles.success}`,
      "",
      ...args
    );
  },
  warning: (message: string, ...args: any[]) => {
    console.log(
      `%c[Compiler]%c ${message}`,
      `${styles.base} ${styles.warning}`,
      "",
      ...args
    );
  },
  error: (message: string, ...args: any[]) => {
    console.log(
      `%c[Compiler]%c ${message}`,
      `${styles.base} ${styles.error}`,
      "",
      ...args
    );
  },
  info: (message: string, ...args: any[]) => {
    console.log(
      `%c[Compiler]%c ${message}`,
      `${styles.base} ${styles.info}`,
      "",
      ...args
    );
  },
};
