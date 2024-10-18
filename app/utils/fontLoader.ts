import fontsData from "../../data/fonts.json";

interface FontVariant {
  weight: string;
  style: string;
  path: string;
}

interface Font {
  family: string;
  variants: FontVariant[];
}

const loadedFonts: Set<string> = new Set();

export async function loadFont(fontFamily: string): Promise<void> {
  if (loadedFonts.has(fontFamily)) return;

  const font = fontsData.find((f: Font) => f.family === fontFamily);
  if (!font) throw new Error(`Font family "${fontFamily}" not found`);

  const fontFaces = font.variants.map(
    (variant: FontVariant) =>
      new FontFace(fontFamily, `url(${variant.path})`, {
        weight: variant.weight,
        style: variant.style,
      })
  );

  await Promise.all(fontFaces.map((fontFace) => fontFace.load()));
  fontFaces.forEach((fontFace) => document.fonts.add(fontFace));

  loadedFonts.add(fontFamily);
}

export function unloadFont(fontFamily: string): void {
  if (!loadedFonts.has(fontFamily)) return;

  document.fonts.delete(fontFamily);
  loadedFonts.delete(fontFamily);
}

export function getLoadedFonts(): string[] {
  return Array.from(loadedFonts);
}
