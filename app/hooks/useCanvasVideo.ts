import { useState, useEffect, useCallback } from "react";

export function useCanvasVideo(trackId: string | undefined) {
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [canvasAvailable, setCanvasAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCanvas = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await fetch(`/api/spotify/get-canvas?trackInfo=${id}`);
      const data = await response.json();

      if (data.videoLink) {
        setVideoLink(data.videoLink);
        setCanvasAvailable(true);
      } else {
        setVideoLink(null);
        setCanvasAvailable(false);
      }
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      setVideoLink(null);
      setCanvasAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trackId) {
      fetchCanvas(trackId);
    }
  }, [trackId, fetchCanvas]);

  return { videoLink, canvasAvailable, isLoading, isError, error };
}
