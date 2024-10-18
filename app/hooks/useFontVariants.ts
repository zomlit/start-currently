import { useQuery } from "@tanstack/react-query";
import { useGoogleFonts } from "./useGoogleFonts";

interface GoogleFontVariant {
  value: string;
  label: string;
  weight: string;
  style: "normal" | "italic";
}

export const useFontVariants = (selectedFont: string) => {
  const { data: googleFonts } = useGoogleFonts();

  return useQuery<GoogleFontVariant[]>({
    queryKey: ["fontVariants", selectedFont],
    queryFn: () => {
      if (!googleFonts) return [];
      const font = googleFonts.find((f) => f.family === selectedFont);
      if (!font) return [];
      return font.variants.map((variant) => {
        const isItalic = variant.includes("italic");
        const weight = variant.replace("italic", "").trim() || "400";
        return {
          value: variant,
          label: `${weight}${isItalic ? " Italic" : ""}`,
          weight: weight === "regular" ? "400" : weight,
          style: isItalic ? "italic" : "normal",
        };
      });
    },
    enabled: !!selectedFont && !!googleFonts,
    staleTime: Infinity,
  });
};
