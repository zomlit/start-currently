import React from "react";
import { type VisualizerSettings } from "@/types/visualizer";
import SkinRounded from "@/components/skins/visualizer/skin-rounded";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";
import type { Tables } from "@/types/supabase";

type VisualizerWidget = Tables<"VisualizerWidget">;

interface SpotifyTrackData {
  id: string;
  album: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  elapsed: number;
  isPlaying: boolean;
  progress: number;
  songUrl: string;
}

interface VisualizerPreviewProps {
  settings: VisualizerSettings;
}

export function VisualizerPreview({ settings }: VisualizerPreviewProps) {
  const { commonSettings, visualSettings } = settings;
  const { nowPlaying } = useElysiaSessionContext();
  const nowPlayingData = useDatabaseStore(
    (state) => state.VisualizerWidget?.[0]
  );

  // Use real-time data from Elysia if available, otherwise fall back to database data
  const trackData =
    nowPlaying?.track ||
    (nowPlayingData?.track
      ? ((typeof nowPlayingData.track === "string"
          ? JSON.parse(nowPlayingData.track)
          : nowPlayingData.track) as SpotifyTrackData)
      : null);

  // Transform track data to match skin-rounded's expected format
  const transformedTrack = trackData
    ? {
        title: trackData.title || "No track playing",
        artist: trackData.artist || "Unknown Artist",
        artwork: trackData.artwork || undefined,
        progress: trackData.progress || 0,
        isPlaying: trackData.isPlaying || false,
        elapsed: trackData.elapsed || 0,
        duration: trackData.duration || 0,
        id: trackData.id || "",
      }
    : undefined;

  return (
    <div className="flex-1 p-4">
      <SkinRounded
        track={transformedTrack}
        commonSettings={{
          backgroundColor: commonSettings.backgroundColor,
          padding: commonSettings.padding,
          showBorders: commonSettings.showBorders,
          fontFamily: commonSettings.fontFamily,
          fontSize: commonSettings.fontSize,
          textColor: commonSettings.textColor,
          borderColor: commonSettings.borderColor,
          borderWidth: commonSettings.borderWidth,
          borderRadius: commonSettings.borderRadius,
          lineHeight: commonSettings.lineHeight,
          letterSpacing: commonSettings.letterSpacing,
          textAlign: commonSettings.textAlign,
          gap: commonSettings.gap,
        }}
        specificSettings={{
          mode: visualSettings.mode,
          colorSync: visualSettings.colorSync,
          canvasEnabled: visualSettings.canvasEnabled,
          micEnabled: visualSettings.micEnabled,
          backgroundOpacity: visualSettings.backgroundOpacity,
          albumCanvas: visualSettings.albumCanvas,
          backgroundCanvas: visualSettings.backgroundCanvas,
          backgroundCanvasOpacity: visualSettings.backgroundCanvasOpacity,
          pauseEnabled: visualSettings.pauseEnabled,
          hideOnDisabled: visualSettings.hideOnDisabled,
          selectedSkin: "rounded",
          // Add required properties with defaults
          progressBarForegroundColor: "#ffffff",
          progressBarBackgroundColor: "#000000",
          gradient: "rainbow",
          fillAlpha: 0.5,
          lineWidth: 1,
          channelLayout: "dual-combined",
          frequencyScale: "bark",
          linearAmplitude: true,
          linearBoost: 1.8,
          showPeaks: false,
          outlineBars: true,
          weightingFilter: "D",
          barSpace: 0.1,
          ledBars: false,
          lumiBars: false,
          reflexRatio: 0,
          reflexAlpha: 0.15,
          reflexBright: 1,
          mirror: 0,
          splitGradient: false,
          // Add missing required properties
          syncTextShadow: false,
          roundBars: false,
        }}
        isPublicView={false}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
