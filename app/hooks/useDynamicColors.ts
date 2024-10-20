import { useState, useEffect } from "react";
import Vibrant from "node-vibrant";
import { SpotifyTrack } from "@/types/spotify";

export function useDynamicColors(track: SpotifyTrack | null, settings: any) {
  const [palette, setPalette] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const colorSyncSetting = settings?.colorSync ?? false;
  const hasTrackImage = !!track?.artwork;
  const colorSyncEnabled = colorSyncSetting && hasTrackImage;

  useEffect(() => {
    const currentArtwork = track?.artwork;
    if (colorSyncEnabled && currentArtwork) {
      setIsLoading(true);
      Vibrant.from(currentArtwork)
        .getPalette()
        .then((extractedPalette) => {
          setPalette(extractedPalette);
          setIsLoading(false);
          setIsReady(true);
        })
        .catch((error) => {
          console.error("Error extracting palette:", error);
          setIsLoading(false);
          setIsReady(true);
        });
    } else {
      setIsLoading(false);
      setIsReady(true);
      setPalette(null);
    }
  }, [track?.artwork, colorSyncEnabled]);

  return { palette, isLoading, colorSyncEnabled, isReady };
}
