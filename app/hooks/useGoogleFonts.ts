import { useQuery } from "@tanstack/react-query";

interface GoogleFont {
  family: string;
  variants: string[];
  files: Record<string, string>;
  category: string;
}

// Fallback fonts in case API fails
const FALLBACK_FONTS: GoogleFont[] = [
  {
    family: "Inter",
    variants: ["regular"],
    files: {},
    category: "sans-serif",
  },
  {
    family: "Roboto",
    variants: ["regular"],
    files: {},
    category: "sans-serif",
  },
  {
    family: "Open Sans",
    variants: ["regular"],
    files: {},
    category: "sans-serif",
  },
];

const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_PUBLIC_GOOGLE_FONTS_API_KEY;

export const useGoogleFonts = () => {
  return useQuery({
    queryKey: ["google-fonts"],
    queryFn: async () => {
      try {
        if (!GOOGLE_FONTS_API_KEY) {
          console.warn("Google Fonts API key not found, using fallback fonts");
          return FALLBACK_FONTS;
        }

        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
        );

        if (!response.ok) {
          throw new Error(`Google Fonts API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.items as GoogleFont[];
      } catch (error) {
        console.error("Error fetching Google Fonts:", error);
        return FALLBACK_FONTS;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity, // Using gcTime instead of deprecated cacheTime
    retry: false,
  });
};
