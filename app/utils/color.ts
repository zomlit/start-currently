type RGBAColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export function parseRgba(color: string): RGBAColor {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  // Handle rgba colors
  if (color.startsWith("rgba")) {
    const [r, g, b, a] = color
      .slice(5, -1)
      .split(",")
      .map((n) => parseFloat(n.trim()));
    return { r, g, b, a };
  }

  // Handle rgb colors
  if (color.startsWith("rgb")) {
    const [r, g, b] = color
      .slice(4, -1)
      .split(",")
      .map((n) => parseInt(n.trim()));
    return { r, g, b, a: 1 };
  }

  // Default fallback
  return { r: 0, g: 0, b: 0, a: 1 };
}

export function rgbaToString({ r, g, b, a }: RGBAColor): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
