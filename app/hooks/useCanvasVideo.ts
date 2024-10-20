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
      const response = await fetch(
        `${import.meta.env.VITE_ELYSIA_API_URL}/spotify/get-canvas?trackInfo=${id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        setVideoLink(data.videoLink);
        setCanvasAvailable(data.canvasAvailable);
      } else {
        throw new Error(data.error || "Failed to fetch canvas");
      }
    } catch (err) {
      setIsError(true);
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
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
