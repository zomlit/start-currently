export const getEnvVar = (
  key: keyof ImportMetaEnv,
  defaultValue?: string
): string => {
  const value = import.meta.env[key] || process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

// Usage example
export const API_URL = getEnvVar("VITE_API_URL", "http://localhost:9001");
export const WEBSOCKET_URL = getEnvVar(
  "VITE_WEBSOCKET_URL",
  "ws://localhost:49122"
);
