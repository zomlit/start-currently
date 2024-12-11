import { useEffect, useState } from "react";
import Vibrant from "node-vibrant";

interface DynamicColorsOptions {
  enabled?: boolean;
}

export function useDynamicColors(
  artwork?: string,
  options: DynamicColorsOptions = {}
) {
  const [palette, setPalette] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!artwork || !options.enabled) return;

    setIsLoading(true);
    Vibrant.from(artwork)
      .getPalette()
      .then((result) => {
        setPalette(result);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [artwork, options.enabled]);

  const colors = {
    primary: palette?.Vibrant?.hex || "#000000",
    secondary: palette?.Muted?.hex || "#ffffff",
  };

  return {
    palette,
    colors,
    isLoading,
    isReady: !!palette && !isLoading,
  };
}
