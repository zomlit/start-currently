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
        `${import.meta.env.VITE_ELYSIA_API_URL}/api/spotify/canvas?trackInfo=${id}`
      );

      // Check for Cloudflare protection page
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("text/html")) {
        console.warn("Cloudflare bot protection detected on canvas service");
        console.info("Spotify canvas video link: null");
        setVideoLink(null);
        setCanvasAvailable(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setVideoLink(data.videoLink);
        setCanvasAvailable(data.canvasAvailable);
      } else {
        // Handle specific error cases
        if (data.error?.includes("Cloudflare")) {
          console.warn("Cloudflare bot protection detected on canvas service");
          console.info("Spotify canvas video link: null");
          setVideoLink(null);
          setCanvasAvailable(false);
          return;
        }
        throw new Error(data.error || "Failed to fetch canvas");
      }
    } catch (err) {
      setIsError(true);
      // Don't show Cloudflare errors to users
      if (err instanceof Error && err.message.includes("Cloudflare")) {
        console.warn("Cloudflare bot protection detected on canvas service");
        setError(new Error("Canvas temporarily unavailable"));
      } else {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      }
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
