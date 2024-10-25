import { useState, useEffect } from "react";
import { useDatabaseStore } from "@/store/supabaseCacheStore";

export function useLastPlayedTrack(userId: string) {
  const [lastPlayedTrack, setLastPlayedTrack] = useState<SpotifyTrack | null>(
    null
  );
  const visualizerWidgetData = useDatabaseStore(
    (state) => state.VisualizerWidget
  );
  const subscribeToVisualizerWidget = useDatabaseStore(
    (state) => state.subscribeToVisualizerWidget
  );
  const unsubscribeFromVisualizerWidget = useDatabaseStore(
    (state) => state.unsubscribeFromVisualizerWidget
  );

  useEffect(() => {
    if (userId) {
      subscribeToVisualizerWidget(userId);
    }

    return () => {
      unsubscribeFromVisualizerWidget();
    };
  }, [userId, subscribeToVisualizerWidget, unsubscribeFromVisualizerWidget]);

  useEffect(() => {
    if (visualizerWidgetData && visualizerWidgetData.length > 0) {
      const latestWidget =
        visualizerWidgetData[visualizerWidgetData.length - 1];
      if (latestWidget.track) {
        const trackData =
          typeof latestWidget.track === "string"
            ? JSON.parse(latestWidget.track)
            : latestWidget.track;
        setLastPlayedTrack(trackData);
        console.log("trackData", trackData);
      }
    }
  }, [visualizerWidgetData]);

  return { lastPlayedTrack };
}
