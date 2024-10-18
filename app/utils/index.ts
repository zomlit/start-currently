export * from "./supabaseHelpers";
export * from "./globalHelpers";
export * from "./authHelpers";

export const parseRgba = (color: string): { r: number; g: number; b: number; a: number } => {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 }; // Default color if parsing fails
};
