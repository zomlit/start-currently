type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    if (levels[level] >= levels[this.level]) {
      const timestamp = new Date().toISOString();
      console[level](
        `[${timestamp}] ${level.toUpperCase()}: ${message}`,
        ...args
      );
    }
  }

  debug(message: string, ...args: any[]) {
    this.log("debug", message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log("info", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("warn", message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log("error", message, ...args);
  }

  apiHitCount(count: number) {
    let color = "\x1b[32m"; // green
    if (count >= 60 && count < 120) color = "\x1b[33m"; // yellow
    if (count >= 120) color = "\x1b[31m"; // red
    this.info(`${color}Spotify API hit count: ${count}/180\x1b[0m`);
  }
}

const customLogger = new Logger(
  process.env.NODE_ENV === "production" ? "info" : "debug"
);

export default customLogger;

export function logError(message: string, error: any) {
  customLogger.error(message, { error });
}
