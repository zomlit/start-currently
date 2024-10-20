import { useEffect, useState } from "react";
import { useCanvasVideo } from "@/hooks/useCanvasVideo";

export const useBackgroundVideo = (trackId: string | undefined) => {
  const { videoLink, isLoading, isError, error } = useCanvasVideo(trackId);
  const [backgroundVideo, setBackgroundVideo] = useState("");

  useEffect(() => {
    if (videoLink) {
      setBackgroundVideo(videoLink);
    } else {
      setBackgroundVideo("");
    }
  }, [videoLink, isLoading, isError, trackId]);

  if (isError) {
    console.error("useBackgroundVideo ERROR:", error);
    console.error("Error details:", {
      trackId,
      isLoading,
      isError,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  return backgroundVideo;
};
