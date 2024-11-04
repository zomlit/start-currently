import React, { useState, useRef, useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SpotifyTrack } from "@/types/spotify";
import { useAuth, useUser } from "@clerk/tanstack-start";
import { supabase } from "@/utils/supabase/client";
import { useLyricsStore } from "@/store/lyricsStore";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDebouncedCallback } from "use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { useDynamicColors } from "@/hooks/useDynamicColors";
import { useBackgroundVideo } from "@/hooks/useBackgroundVideo";
import { useLyrics } from "@/hooks/useLyrics";
import {
  LyricsSettingsForm,
  LyricsSettings,
  lyricsSchema,
} from "@/components/widget-settings/LyricsSettingsForm";
import { toast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const spotifyTokenSchema = z
  .string()
  .min(100, "Token too short")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Token should only contain letters, numbers, underscores, and hyphens"
  );

export const Route = createFileRoute("/_lyrics/lyrics/")({
  component: LyricsPage,
});

function LyricsPage() {
  const [isSpotifyTokenDialogOpen, setIsSpotifyTokenDialogOpen] =
    useState(false);
  const [spotifyToken, setSpotifyToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const { userId, getToken } = useAuth();
  const { user } = useUser();
  const [fontFamilies, setFontFamilies] = useState<string[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [isFontLoading, setIsFontLoading] = useState(false);
  const [noLyricsAvailable, setNoLyricsAvailable] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  const { settings, updateSettings } = useLyricsStore();

  const {
    track,
    lyrics,
    isLyricsLoading,
    lyricsError,
    noLyricsAvailable,
    isUnauthorized,
    isTokenSet,
    formatColor,
    censorExplicitContent,
    truncateText,
    getTextStyle,
  } = useLyrics({
    settings,
  });

  const videoLink = useBackgroundVideo(track?.id);

  const { palette, isLoading: isPaletteLoading } = useDynamicColors(track, {
    colorSync: settings.colorSync,
  });

  // Font loading logic
  const injectFont = useCallback(
    (fontFamily: string) => {
      if (!loadedFonts.has(fontFamily)) {
        const link = document.createElement("link");
        link.href = `https://fonts.googleapis.com/css?family=${fontFamily.replace(/ /g, "+")}`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
        setLoadedFonts((prev) => new Set(prev).add(fontFamily));
      }
    },
    [loadedFonts]
  );

  // Settings update logic
  const debouncedUpdateSettings = useDebouncedCallback(
    (newSettings: Partial<LyricsSettings>) => {
      updateSettings(newSettings);
    },
    300
  );

  const handleSettingChange = useCallback(
    (newSettings: Partial<LyricsSettings>) => {
      if (
        Object.keys(newSettings).length ===
        Object.keys(lyricsSchema.shape).length
      ) {
        updateSettings(newSettings as LyricsSettings);
      } else {
        debouncedUpdateSettings(newSettings);
      }
    },
    [debouncedUpdateSettings, updateSettings]
  );

  // URL and copy handling
  const handleCopyPublicUrl = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (publicUrl) {
        navigator.clipboard
          .writeText(publicUrl)
          .then(() => {
            toast.success({ title: "Public URL copied to clipboard" });
          })
          .catch((err) => {
            console.error("Failed to copy URL to clipboard:", err);
            toast.error({ title: "Failed to copy URL to clipboard" });
          });
      }
    },
    [publicUrl]
  );

  // Spotify token handling
  const handleSpotifyTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    let tokenToSubmit = spotifyToken.trim().replace(/^sp_dc=/, "");

    try {
      spotifyTokenSchema.parse(tokenToSubmit);
      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No authorization token available");

      const url = new URL(
        `${import.meta.env.VITE_ELYSIA_API_URL}/spotify/set-token`
      );
      url.searchParams.append("token", tokenToSubmit);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success({
          title: "Spotify lyrics token set successfully",
          description: responseData.message || "Token updated",
        });
        setIsSpotifyTokenDialogOpen(false);
        setSpotifyToken("");
        if (track?.id) {
          // Refetch lyrics with new token
          window.location.reload();
        }
      } else {
        throw new Error(responseData.message || "Failed to set Spotify token");
      }
    } catch (error) {
      console.error("Error setting Spotify token:", error);
      if (error instanceof z.ZodError) {
        setTokenError(error.errors[0].message);
      } else {
        toast.error({
          title: "Failed to set Spotify token",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }
  };

  // Effects
  useEffect(() => {
    if (settings.fontFamily) {
      injectFont(settings.fontFamily);
    }
  }, [settings.fontFamily, injectFont]);

  useEffect(() => {
    const fetchFonts = async () => {
      if (fontFamilies.length === 0) {
        setIsFontLoading(true);
        try {
          const response = await fetch(
            `https://www.googleapis.com/webfonts/v1/webfonts?key=${
              import.meta.env.VITE_PUBLIC_GOOGLE_FONTS_API_KEY
            }&sort=popularity`
          );
          const data = await response.json();
          setFontFamilies([
            ...data.items.slice(0, 100).map((font: any) => font.family),
            "Sofia Sans Condensed",
          ]);
        } catch (error) {
          console.error("Error fetching fonts:", error);
        } finally {
          setIsFontLoading(false);
        }
      }
    };
    fetchFonts();
  }, [fontFamilies.length]);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (lyricsContainerRef.current) {
        setContainerWidth(lyricsContainerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  useEffect(() => {
    if (user?.username) {
      setPublicUrl(
        window.location.origin + "/" + user.username + window.location.pathname
      );
    }
  }, [user?.username]);

  // Color sync effect
  useEffect(() => {
    if (settings.colorSync && palette && !isPaletteLoading) {
      const backgroundColor =
        palette.DarkMuted?.hex || settings.backgroundColor;
      const textColor = palette.LightVibrant?.hex || settings.textColor;
      const currentTextColor =
        palette.Vibrant?.hex || settings.currentTextColor;

      const ensureContrast = (color: string, bgColor: string) => {
        // ... contrast calculation logic ...
        return color;
      };

      const updatedTextColor = ensureContrast(textColor, backgroundColor);
      const updatedCurrentTextColor = ensureContrast(
        currentTextColor,
        backgroundColor
      );

      debouncedUpdateSettings({
        backgroundColor,
        textColor: updatedTextColor,
        currentTextColor: updatedCurrentTextColor,
      });
    }
  }, [
    palette,
    isPaletteLoading,
    track,
    settings.colorSync,
    debouncedUpdateSettings,
  ]);

  // Add this function to calculate contrast ratio
  const getContrast = (foreground: string, background: string) => {
    const getLuminance = (color: string) => {
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const luminance1 = getLuminance(foreground);
    const luminance2 = getLuminance(background);
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  useEffect(() => {
    const updateUrl = () => {
      if (user?.username) {
        const formattedUrl = `${window.location.origin}/${user.username}/lyrics`;
        console.log("Username found:", user.username);
        console.log("Current publicUrl before update:", publicUrl);
        console.log("Setting new publicUrl to:", formattedUrl);

        // Force state update and re-render
        setPublicUrl(formattedUrl);

        // Double-check the update
        setTimeout(() => {
          console.log("Public URL after update:", formattedUrl);
        }, 0);
      }
    };

    updateUrl();
  }, [user, user?.username]);

  const handleCopyPublicUrl = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (user?.username) {
        const urlToCopy = `${window.location.origin}/${user.username}/lyrics`;
        navigator.clipboard
          .writeText(urlToCopy)
          .then(() => {
            toast.success({
              title: "Public URL copied to clipboard",
              description: urlToCopy,
            });
          })
          .catch((err) => {
            console.error("Failed to copy URL to clipboard:", err);
            toast.error({
              title: "Failed to copy URL to clipboard",
            });
          });
      }
    },
    [user?.username]
  );

  const handleSettingChange = useCallback(
    (newSettings: Partial<LyricsSettings>) => {
      console.log("Current publicUrl in settings:", publicUrl);
      updateSettings(newSettings);
    },
    [updateSettings, publicUrl]
  );

  const getTextStyle = (isCurrentLine: boolean) => ({
    color: formatColor(
      isCurrentLine ? settings.currentTextColor : settings.textColor
    ),
    fontSize: `${isCurrentLine ? settings.fontSize * settings.currentLineScale : settings.fontSize}px`,
    fontWeight: isCurrentLine ? "bold" : "normal",
    transform: isCurrentLine
      ? `scale(${settings.currentLineScale})`
      : "scale(1)",
    transformOrigin:
      settings.textAlign === "left"
        ? "left center"
        : settings.textAlign === "right"
          ? "right center"
          : "center center",
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    textShadow: `${settings.textShadowOffsetX}px ${settings.textShadowOffsetY}px ${settings.textShadowBlur}px ${formatColor(settings.textShadowColor)}`,
    transition: `all ${settings.animationSpeed}ms ${settings.animationEasing}`,
    ...(settings.glowEffect
      ? {
          filter: `drop-shadow(0 0 ${settings.glowIntensity}px ${formatColor(settings.glowColor)})`,
        }
      : {}),
  });

  const handleSpotifyTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);

    let tokenToSubmit = spotifyToken.trim();

    // Remove "sp_dc=" prefix if present
    tokenToSubmit = tokenToSubmit.replace(/^sp_dc=/, "");

    try {
      // Validate the token
      spotifyTokenSchema.parse(tokenToSubmit);

      const token = await getToken({ template: "lstio" });
      if (!token) throw new Error("No authorization token available");

      const url = new URL(
        `${import.meta.env.VITE_ELYSIA_API_URL}/spotify/set-token`
      );
      url.searchParams.append("token", tokenToSubmit);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success({
          title: "Spotify lyrics token set successfully",
          description: responseData.message || "Token updated",
        });
        setIsSpotifyTokenDialogOpen(false);
        setSpotifyToken(""); // Clear the input after successful submission
        // Optionally, you might want to refetch lyrics here if a track is currently loaded
        if (currentTrack?.id) {
          fetchLyrics(currentTrack.id);
        }
      } else {
        throw new Error(responseData.message || "Failed to set Spotify token");
      }
    } catch (error) {
      console.error("Error setting Spotify token:", error);
      if (error instanceof z.ZodError) {
        setTokenError(error.errors[0].message);
      } else {
        toast.error({
          title: "Failed to set Spotify token",
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }
  };

  const [isImagePopoverOpen, setIsImagePopoverOpen] = useState(false);

  useEffect(() => {
    // Set the public URL based on the current route
    const currentUrl = window.location.origin + window.location.pathname;
    setPublicUrl(currentUrl);
  }, []);

  useEffect(() => {
    const fetchSpotifyToken = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase
            .from("UserProfile")
            .select("s_sp_dc") // Adjust the column name as necessary
            .eq("user_id", userId)
            .single();

          if (error) throw error;

          if (data) {
            setSpotifyToken(data.s_sp_dc || ""); // Set the token or empty string
          }
        } catch (error) {
          console.error("Error fetching Spotify token:", error);
        }
      }
    };

    fetchSpotifyToken();
  }, [userId]);

  const LyricsSettings = (
    <>
      {lyrics && (
        <>
          <div className="flex items-center space-x-2 mb-6">
            <Input
              key={publicUrl}
              value={publicUrl}
              readOnly
              className="flex-grow ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={handleCopyPublicUrl}
              size="icon"
              variant="outline"
              className="ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <LyricsSettingsForm
            settings={settings}
            onSettingsChange={handleSettingChange}
            publicUrl={publicUrl} // Pass the state directly
            onCopyPublicUrl={handleCopyPublicUrl}
            fontFamilies={fontFamilies}
            isFontLoading={isFontLoading}
            injectFont={injectFont}
            isVideoAvailable={!!videoLink}
          />
          <Button
            onClick={() => setIsSpotifyTokenDialogOpen(true)}
            variant="outline"
            className="w-full"
          >
            {isTokenSet ? "Update" : "Add"} Spotify Lyrics Token
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className="h-screen w-full overflow-hidden scrollbar-hide">
      <ResizablePanelGroup direction="horizontal">
        {/* Main lyrics panel */}
        <ResizablePanel defaultSize={80} minSize={50}>
          <div
            className="h-full overflow-hidden relative"
            style={{
              backgroundColor: settings.greenScreenMode
                ? "#00FF00"
                : formatColor(settings.backgroundColor),
              padding: `${settings.padding}px`,
            }}
          >
            {settings.showVideoCanvas && videoLink && (
              <video
                src={videoLink}
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ opacity: settings.videoCanvasOpacity }}
                autoPlay
                loop
                muted
                playsInline
              />
            )}
            {settings.showFade && !settings.greenScreenMode && (
              <>
                <div
                  className="absolute z-40 left-0 right-0 pointer-events-none"
                  style={{
                    top: `${settings.padding}px`,
                    height: `${settings.fadeDistance}px`,
                    background: `linear-gradient(to bottom, ${formatColor(
                      settings.backgroundColor
                    )}, rgba(0,0,0,0))`,
                  }}
                />
                <div
                  className="absolute z-40 left-0 right-0 pointer-events-none"
                  style={{
                    bottom: `${settings.padding}px`,
                    height: `${settings.fadeDistance}px`,
                    background: `linear-gradient(to top, ${formatColor(
                      settings.backgroundColor
                    )}, rgba(0,0,0,0))`,
                  }}
                />
              </>
            )}
            <div
              ref={lyricsContainerRef}
              className="h-full overflow-y-auto scrollbar-hide relative z-20"
              style={{
                fontFamily: `'${settings.fontFamily}', 'Sofia Sans Condensed', sans-serif`,
              }}
            >
              {isLyricsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner className="w-[30px] h-[30px]" />
                </div>
              ) : isUnauthorized ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <p className="mb-4">Spotify token required to fetch lyrics</p>
                  <Button
                    onClick={() => setIsSpotifyTokenDialogOpen(true)}
                    variant="outline"
                  >
                    Add Spotify Lyrics Token
                  </Button>
                </div>
              ) : noLyricsAvailable ? (
                <div className="flex items-center justify-center h-full text-center text-gray-500">
                  No lyrics available for this track
                </div>
              ) : lyrics && lyrics.length > 0 ? (
                <>
                  <div style={{ height: "50vh" }}></div>
                  {lyrics.map((line, index, arr) => {
                    const isCurrentLine =
                      (track?.elapsed || 0) >= line.startTimeMs - 1000 &&
                      (index === arr.length - 1 ||
                        (track?.elapsed || 0) <
                          arr[index + 1].startTimeMs - 1000);

                    const displayedText = settings.hideExplicitContent
                      ? censorExplicitContent(line.words)
                      : line.words;

                    const truncatedText = truncateText(
                      displayedText,
                      containerWidth - settings.padding * 2,
                      isCurrentLine
                        ? settings.fontSize * settings.currentLineScale
                        : settings.fontSize,
                      settings.fontFamily
                    );

                    return (
                      <p
                        key={index}
                        className="transition-all duration-300"
                        style={getTextStyle(isCurrentLine)}
                      >
                        {truncatedText}
                      </p>
                    );
                  })}
                  <div style={{ height: "50vh" }}></div>
                </>
              ) : null}
            </div>
          </div>
        </ResizablePanel>

        {/* Settings panel */}
        <ResizableHandle className="focus:ring-offset-0 focus-visible:ring-offset-0" />
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          className="flex flex-col bg-background"
        >
          <div className="flex-grow overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold p-6 pb-2">
              Customize Lyrics Panel
            </h3>
            <div className="flex-grow overflow-y-auto">
              <div className="p-6 pt-2">{LyricsSettings}</div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Spotify token dialog */}
      <Dialog
        open={isSpotifyTokenDialogOpen}
        onOpenChange={setIsSpotifyTokenDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {spotifyToken
                ? "Edit Spotify Lyrics Token"
                : "Add Spotify Lyrics Token"}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                To enable lyrics fetching, please follow these steps to find
                your Spotify token (sp_dc):
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>
                    Open your browser and go to{" "}
                    <a
                      href="https://open.spotify.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-500 hover:text-violet-600"
                    >
                      https://open.spotify.com/
                    </a>
                  </li>
                  <li>Make sure you're logged into your Spotify account</li>
                  <li>
                    Open Developer Tools (press F12 or right-click and select
                    'Inspect')
                  </li>
                  <li>
                    Go to the 'Application' tab (Chrome) or 'Storage' tab
                    (Firefox)
                  </li>
                  <li>
                    In the left sidebar, expand 'Cookies' and click on
                    'https://open.spotify.com'
                  </li>
                  <li>Find the cookie named 'sp_dc' in the list</li>
                  <li>
                    Copy the value of the 'sp_dc' cookie and paste it below
                  </li>
                </ol>
              </div>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSpotifyTokenSubmit} className="mb-0">
            <Input
              type="password"
              value={spotifyToken}
              onChange={(e) => {
                setSpotifyToken(e.target.value);
                setTokenError(null);
              }}
              placeholder="Enter your sp_dc token value"
              className={cn("my-4", spotifyToken ? "" : "")}
            />
            {tokenError && (
              <p className="text-sm text-red-500 mt-1">{tokenError}</p>
            )}
            <DialogFooter>
              <Button
                type="submit"
                variant="outline"
                className="mt-4 bg-violet-500 hover:bg-violet-600"
              >
                Save Token
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LyricsPage;
