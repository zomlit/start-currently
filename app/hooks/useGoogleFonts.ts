import { useQuery } from "@tanstack/react-query";

const API_KEY = process.env.VITE_PUBLIC_GOOGLE_FONTS_API_KEY;

export const useGoogleFonts = () => {
  return useQuery({
    queryKey: ["googleFonts"],
    queryFn: async () => {
      if (!API_KEY) {
        throw new Error("Google Fonts API key is not set");
      }
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity&subset=latin&fields=items(family,variants)`
      );
      if (!response.ok) {
        throw new Error(`Google Fonts API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.items.slice(0, 100);
    },
    staleTime: Infinity,
  });
};
