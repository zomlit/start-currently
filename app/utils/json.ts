export function safeJsonParse<T>(
  value: string | null | undefined,
  fallback: T
): T {
  if (!value) return fallback;
  try {
    if (typeof value === "object") {
      return value as T;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Error parsing JSON:", error, "Value:", value);
    return fallback;
  }
}
