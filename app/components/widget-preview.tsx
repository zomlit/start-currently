import React, { useEffect, useState } from "react";
import Vibrant from "node-vibrant";
import { WidgetType, WidgetProfile, ProfileSettings } from "@/types";
import SkinRounded from "@/components/skins/visualizer/skin-rounded";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useDynamicColors } from "@/hooks/useDynamicColors";
// import Tiptap from "@/components/Tiptap";
import { useLastPlayedTrack } from "@/hooks/useLastPlayedTrack";
import { SpotifyTrack } from "@/types/spotify";
import { Spinner } from "@/components/ui/spinner";

import type { Database } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { loadProfile } from "@/utils/widgetDbOperations";
import { supabase } from "@/utils/supabase/client";
interface WidgetPreviewProps {
  currentProfile: WidgetProfile;
  selectedWidget: WidgetType;
  isPublicView?: boolean;
  userId?: string;
  initialTrack?: SpotifyTrack;
}

export function WidgetPreview({
  currentProfile,
  selectedWidget,
  isPublicView,
  userId,
  initialTrack,
  optimisticSettings = defaultSettings,
}: WidgetPreviewProps) {
  console.log("WidgetPreview props:", {
    currentProfile,
    selectedWidget,
    isPublicView,
    userId,
    initialTrack,
  });

  if (!currentProfile) {
    console.error("currentProfile is undefined in WidgetPreview");
    return <div>Error: Profile data is missing</div>;
  }

  const [previewSettings, setPreviewSettings] = useState(
    currentProfile.settings
  );
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(
    initialTrack || null
  );
  const { lastPlayedTrack } = useLastPlayedTrack(userId || "");

  const trackToUse = currentTrack || lastPlayedTrack || null;

  const {
    palette: dynamicPalette,
    isLoading,
    colorSyncEnabled,
    isReady,
  } = useDynamicColors(
    trackToUse,
    optimisticSettings?.settings?.specificSettings || {}
  );

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
            console.log("Palette generated:", palette);
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

  const commonSettings =
    optimisticSettings?.settings?.commonSettings ||
    currentProfile.settings.commonSettings ||
    {};
  const specificSettings =
    optimisticSettings?.settings?.specificSettings ||
    currentProfile.settings.specificSettings ||
    {};

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
    const { commonSettings, specificSettings } = previewSettings;
    console.log("Rendering preview for widget:", selectedWidget);
    console.log("isLoading:", isLoading);
    console.log("trackToUse:", trackToUse);

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
        console.log("Rendering SkinRounded with track:", trackToUse);
        return (
          <SkinRounded
            track={trackToUse}
            commonSettings={commonSettings}
            specificSettings={specificSettings}
            isPublicView={isPublicView}
            style={style}
          />
        );
      } else if (selectedWidget === "chat") {
        return (
          <div style={style} className="rounded-lg">
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
            {/* <Tiptap
              initialContent={specificSettings.content || ""}
              onUpdate={() => {}} // No need to update in preview
              textColor={
                colorSyncEnabled && dynamicPalette?.Vibrant
                  ? dynamicPalette.Vibrant.hex
                  : specificSettings.textColor
              }
              backgroundColor={
                colorSyncEnabled && dynamicPalette?.DarkMuted
                  ? dynamicPalette.DarkMuted.hex
                  : specificSettings.backgroundColor
              }
              letterSpacing={commonSettings.letterSpacing}
              lineHeight={commonSettings.lineHeight}
            /> */}
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

  console.log("Final style:", style);
  console.log("Rendering WidgetPreview");

  return (
    <div
      style={style}
      className={`widget-preview ${isPublicView ? "public-view" : ""}`}
    >
      {renderPreview()}
    </div>
  );
}
