import React, { useEffect, useState } from "react";
import Vibrant from "node-vibrant";
import { WidgetType, WidgetProfile, ProfileSettings } from "@/types";
import SkinRounded from "@/components/skins/visualizer/skin-rounded";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useDynamicColors } from "@/hooks/useDynamicColors";
import { useLastPlayedTrack } from "@/hooks/useLastPlayedTrack";
import { SpotifyTrack } from "@/types/spotify";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/utils/supabase/client";
import { LyricsPanel } from "@/components/LyricsPanel";

interface WidgetPreviewProps {
  currentProfile?: WidgetProfile;
  selectedWidget: WidgetType;
  isPublicView?: boolean;
  userId?: string;
  initialTrack?: SpotifyTrack;
}

const defaultSettings: ProfileSettings = {
  common: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    textColor: "rgba(255, 255, 255, 0.5)",
    fontFamily: "Sofia Sans Condensed, sans-serif",
    fontSize: 24,
    fontVariant: "400",
    fontStyle: "normal",
    underline: false,
    strikethrough: false,
    textAlignment: "left",
    lineHeight: 1.4,
    letterSpacing: 0,
    wordSpacing: 0,
    borderColor: "rgba(0, 0, 0, 1)",
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderRadius: 8,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    padding: 0,
    gap: 2,
    matchArtworkColors: true,
    matchArtworkOpacity: 0.5,
    textTransform: "none",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowHorizontal: 1,
    textShadowVertical: 1,
    textShadowBlur: 2,
    canvasEnabled: true,
    albumCanvas: true,
    backgroundCanvas: true,
    backgroundCanvasOpacity: 0.5,
    hideOnDisabled: false,
    pauseEnabled: false,
  },
  specific: {
    showAvatars: true,
    showBadges: true,
    backgroundOpacity: 0.6,
  },
};

export function WidgetPreview({
  currentProfile,
  selectedWidget,
  isPublicView,
  userId,
  initialTrack,
}: WidgetPreviewProps) {
  const [previewSettings, setPreviewSettings] = useState(
    currentProfile?.settings || defaultSettings
  );
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(
    initialTrack || null
  );
  const { lastPlayedTrack } = useLastPlayedTrack(userId || "");

  const [lyrics, setLyrics] = useState<
    { startTimeMs: number; words: string }[] | null
  >(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  const trackToUse = currentTrack || lastPlayedTrack || null;

  const {
    palette: dynamicPalette,
    isLoading,
    colorSyncEnabled,
    isReady,
  } = useDynamicColors(trackToUse, defaultSettings.specific || {});

  useEffect(() => {
    if (trackToUse?.album?.images?.[0]?.url) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = trackToUse.album.images[0].url;
      img.onload = () => {
        Vibrant.from(img)
          .getPalette()
          .then((palette) => {
            // Handle the palette
          })
          .catch((err) =>
            console.error("Error generating color palette:", err)
          );
      };
    }
  }, [trackToUse]);

  useEffect(() => {
    if (initialTrack) {
      setCurrentTrack(initialTrack);
    }
  }, [initialTrack]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`public:VisualizerWidget:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "VisualizerWidget",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const { new: newData } = payload;
          if (newData && newData.track) {
            const trackData =
              typeof newData.track === "string"
                ? JSON.parse(newData.track)
                : newData.track;
            setCurrentTrack(trackData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  useEffect(() => {
    if (currentProfile) {
      setPreviewSettings(currentProfile.settings);
    }
  }, [currentProfile]);

  const fetchLyrics = async (trackId: string) => {
    setIsLyricsLoading(true);
    setLyricsError(null);
    try {
      const response = await fetch(
        `http://localhost:3001/v1/lyrics/${trackId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch lyrics: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.lyrics && Array.isArray(data.lyrics.lines)) {
        setLyrics(data.lyrics.lines);
      } else {
        setLyrics(null);
        throw new Error("Invalid lyrics format");
      }
    } catch (error) {
      setLyricsError(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLyricsLoading(false);
    }
  };

  const handleShowLyrics = () => {
    if (trackToUse?.id) {
      fetchLyrics(trackToUse.id);
    }
  };

  const commonSettings = defaultSettings.common;
  const specificSettings = defaultSettings.specific;

  const getCommonStyles = () => {
    const backgroundColor =
      colorSyncEnabled && isReady && dynamicPalette?.DarkVibrant
        ? `rgba(${dynamicPalette.DarkVibrant.rgb[0]}, ${dynamicPalette.DarkVibrant.rgb[1]}, ${
            dynamicPalette.DarkVibrant.rgb[2]
          }, ${specificSettings.backgroundOpacity ?? 0.6})`
        : commonSettings.backgroundColor || "transparent";

    const fontVariant = commonSettings.fontVariant || "regular";

    // Parse the font variant
    const isItalic = fontVariant.includes("italic");
    let fontWeight = fontVariant.replace("italic", "").trim();
    fontWeight = fontWeight === "regular" ? "400" : fontWeight;

    return {
      color: commonSettings.textColor || "black",
      backgroundColor,
      fontFamily: `'${commonSettings.fontFamily || ""}', sans-serif`,
      fontSize: `${commonSettings.fontSize || "16"}px`,
      fontWeight: fontWeight,
      fontStyle: isItalic ? "italic" : "normal",
      borderColor: commonSettings.borderColor || "transparent",
      borderWidth: `${commonSettings.borderWidth || "0"}px`,
      borderStyle: commonSettings.borderStyle || "solid",
      borderRadius: `${commonSettings.borderRadius || "0"}px`,
      padding: commonSettings.padding
        ? `${commonSettings.padding}px`
        : `${commonSettings.paddingTop || "0"}px ${commonSettings.paddingRight || "0"}px ${
            commonSettings.paddingBottom || "0"
          }px ${commonSettings.paddingLeft || "0"}px`,
      lineHeight: commonSettings.lineHeight || "1.5",
      letterSpacing: `${commonSettings.letterSpacing || "0"}px`,
      gap: `${commonSettings.gap || "0"}px`,
      transition: "all 0.3s ease",
    };
  };

  const style = getCommonStyles();

  const renderPreview = () => {
    if (isLoading) {
      return (
        <Spinner
          className="w-8 fill-violet-300 text-white"
          message="Loading widget..."
        />
      );
    }

    try {
      if (selectedWidget === "visualizer") {
        return (
          <>
            <SkinRounded
              track={trackToUse}
              commonSettings={commonSettings}
              specificSettings={specificSettings}
              isPublicView={isPublicView}
            />
          </>
        );
      } else if (selectedWidget === "chat") {
        return (
          <div className="rounded-lg">
            <h3 className="mb-2 text-lg font-bold">Live Chat Preview</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-2">
                  {specificSettings.showAvatars && (
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                  )}
                  <div>
                    <div className="font-semibold">User {i}</div>
                    <div className="text-sm">Message {i}</div>
                    {specificSettings.showBadges && (
                      <div className="text-xs text-muted-foreground">
                        12:3{i} PM
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      } else if (selectedWidget === "freeform") {
        return (
          <div style={style} className="rounded-lg">
            <h3 className="mb-2 text-lg font-bold">Freeform Preview</h3>
          </div>
        );
      }
      return null;
    } catch (error) {
      console.error("Error rendering preview:", error);
      return (
        <div className="text-foreground">
          <pre className="text-red-500">
            Error: {(error as Error).message || "Failed to render preview"}
          </pre>
        </div>
      );
    }
  };

  return (
    <div
      style={style}
      className={`widget-preview ${isPublicView ? "public-view" : ""}`}
    >
      {renderPreview()}
    </div>
  );
}
