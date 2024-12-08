import { toast } from "sonner";

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
}

export async function fetchFonts(): Promise<GoogleFont[]> {
  try {
    const apiKey = import.meta.env.VITE_PUBLIC_GOOGLE_FONTS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Fonts API key is not configured");
    }

    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching fonts:", error);
    toast.error("Failed to load fonts");
    return [];
  }
}
