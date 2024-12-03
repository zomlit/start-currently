import { useState, useEffect } from "react";
import fontsData from "../../data/fonts.json";

interface Font {
  family: string;
  variants: Array<{ weight: string; style: string; path: string }>;
}

export function useLocalFonts() {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setFonts(fontsData);
    setIsLoading(false);
  }, []);

  return { fonts, isLoading };
}
