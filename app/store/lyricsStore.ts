import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

type LyricsSettings = {
  backgroundColor: string;
  textColor: string;
  currentTextColor: string;
  fontSize: number;
  padding: number;
  currentLineScale: number;
  showFade: boolean;
  lineHeight: number;
  fontFamily: string;
  greenScreenMode: boolean;
  colorSync: boolean;
  showVideoCanvas: boolean;
  videoCanvasOpacity: number;
  textAlign: "left" | "center" | "right";
  textShadowColor: string;
  textShadowAngle: number;
  textShadowDistance: number;
  textShadowBlur: number;
  textShadowOpacity: number;
  textShadowHorizontal: number;
  textShadowVertical: number;
  animationEasing:
    | "linear"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "circIn"
    | "circOut"
    | "circInOut"
    | "backIn"
    | "backOut"
    | "backInOut";
  fadeDistance: number;
  textShadowOffsetX: number;
  textShadowOffsetY: number;
  animationSpeed: number;
  glowEffect: boolean;
  glowColor: string;
  glowIntensity: number;
  hideExplicitContent: boolean;
  animationStyle: "scale" | "glow" | "slide" | "fade" | "bounce";
};

const defaultSettings: LyricsSettings = {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  textColor: "#FFFFFF",
  currentTextColor: "#FFD700",
  fontSize: 24,
  padding: 20,
  currentLineScale: 1.2,
  showFade: true,
  lineHeight: 1.5,
  fontFamily: "Sofia Sans Condensed",
  greenScreenMode: false,
  colorSync: false,
  showVideoCanvas: false,
  videoCanvasOpacity: 0.2,
  textAlign: "center",
  textShadowColor: "rgba(0, 0, 0, 0.5)",
  textShadowAngle: 45,
  textShadowDistance: 5,
  textShadowBlur: 2,
  textShadowOpacity: 0.5,
  textShadowHorizontal: 3.54,
  textShadowVertical: 3.54,
  animationEasing: "easeOut",
  fadeDistance: 64,
  textShadowOffsetX: 1,
  textShadowOffsetY: 1,
  animationSpeed: 300,
  glowEffect: false,
  glowColor: "#FFFFFF",
  glowIntensity: 5,
  hideExplicitContent: false,
  animationStyle: "scale",
};

type LyricsStore = {
  settings: LyricsSettings;
  updateSettings: (newSettings: Partial<LyricsSettings>) => void;
  resetSettings: () => void;
};

export const useLyricsStore = create<LyricsStore>()(
  persist(
    devtools(
      (set) => ({
        settings: defaultSettings,
        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),
        resetSettings: () => set({ settings: defaultSettings }),
      }),
      {
        name: "lyrics-settings-storage",
      }
    ),
    {
      name: "lyrics-settings-storage",
    }
  )
);
