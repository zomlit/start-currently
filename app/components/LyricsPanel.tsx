import React, { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Slider } from "@/components/ui/slider";
import { GradientColorPicker } from "@/components/GradientColorPicker";

const lyricsSchema = z.object({
  backgroundColor: z.string().default("#000000"),
  textColor: z.string().default("#FFFFFF"),
  currentTextColor: z.string().default("#FFD700"),
  fontSize: z.number().min(10).max(30).default(16),
  padding: z.number().min(0).max(20).default(10),
});

type LyricsSettings = z.infer<typeof lyricsSchema>;

interface LyricsPanelProps {
  lyrics: { startTimeMs: number; words: string }[] | null;
  track: {
    elapsed: number;
  };
  onShowLyrics: () => void;
  isLyricsLoading: boolean;
  lyricsError: string | null;
}

export const LyricsPanel: React.FC<LyricsPanelProps> = ({
  lyrics,
  track,
  onShowLyrics,
  isLyricsLoading,
  lyricsError,
}) => {
  const lyricsRef = useRef<HTMLDivElement>(null);

  const { control, watch } = useForm<LyricsSettings>({
    resolver: zodResolver(lyricsSchema),
    defaultValues: {
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
      currentTextColor: "#FFD700",
      fontSize: 16,
      padding: 10,
    },
  });

  const lyricsSettings = watch();

  useEffect(() => {
    if (lyrics && track && lyricsRef.current) {
      const scrollToCurrentLyric = () => {
        const currentTime = track.elapsed;
        const currentLineIndex = lyrics.findIndex(
          (line) =>
            currentTime >= line.startTimeMs &&
            currentTime < line.startTimeMs + 5000
        );

        if (currentLineIndex !== -1 && lyricsRef.current) {
          const lyricsContainer = lyricsRef.current;
          const currentLineElement = lyricsContainer.children[
            currentLineIndex
          ] as HTMLElement;

          if (currentLineElement) {
            const containerHeight = lyricsContainer.clientHeight;
            const lineTop = currentLineElement.offsetTop;
            const lineHeight = currentLineElement.clientHeight;

            const scrollPosition =
              lineTop - containerHeight / 2 + lineHeight / 2;

            lyricsContainer.scrollTo({
              top: scrollPosition,
              behavior: "smooth",
            });
          }
        }
      };

      const intervalId = setInterval(scrollToCurrentLyric, 100);

      return () => clearInterval(intervalId);
    }
  }, [lyrics, track]);

  return (
    <>
      <button
        onClick={onShowLyrics}
        className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300"
      >
        {lyrics ? "Hide Lyrics" : "Show Lyrics"}
      </button>
      {isLyricsLoading && <p>Loading lyrics...</p>}
      {lyricsError && <p className="text-red-500">{lyricsError}</p>}
      {lyrics && (
        <div
          ref={lyricsRef}
          className="mt-2 p-2 rounded max-h-64 overflow-y-auto"
          style={{
            backgroundColor: lyricsSettings.backgroundColor,
            padding: `${lyricsSettings.padding}px`,
          }}
        >
          {lyrics.map((line, index) => (
            <p
              key={index}
              className={`transition-all duration-300 ${
                track.elapsed >= line.startTimeMs &&
                track.elapsed < line.startTimeMs + 5000
                  ? "font-bold"
                  : ""
              }`}
              style={{
                color:
                  track.elapsed >= line.startTimeMs &&
                  track.elapsed < line.startTimeMs + 5000
                    ? lyricsSettings.currentTextColor
                    : lyricsSettings.textColor,
                fontSize: `${lyricsSettings.fontSize}px`,
              }}
            >
              {line.words}
            </p>
          ))}
        </div>
      )}

      {/* Lyrics Customization Form */}
      <div className="mt-4 p-4 bg-white/10 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">
          Customize Lyrics Panel
        </h3>
        <div className="space-y-4">
          <Controller
            name="backgroundColor"
            control={control}
            render={({ field }) => (
              <GradientColorPicker
                color={field.value}
                onChange={field.onChange}
                onChangeComplete={field.onBlur}
                currentProfile={null}
              />
            )}
          />
          <Controller
            name="textColor"
            control={control}
            render={({ field }) => (
              <GradientColorPicker
                color={field.value}
                onChange={field.onChange}
                onChangeComplete={field.onBlur}
                currentProfile={null}
              />
            )}
          />
          <Controller
            name="currentTextColor"
            control={control}
            render={({ field }) => (
              <GradientColorPicker
                color={field.value}
                onChange={field.onChange}
                onChangeComplete={field.onBlur}
                currentProfile={null}
              />
            )}
          />
          <Controller
            name="fontSize"
            control={control}
            render={({ field }) => (
              <Slider
                min={10}
                max={30}
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
              />
            )}
          />
          <Controller
            name="padding"
            control={control}
            render={({ field }) => (
              <Slider
                min={0}
                max={20}
                value={[field.value]}
                onValueChange={(val) => field.onChange(val[0])}
              />
            )}
          />
        </div>
      </div>
    </>
  );
};
