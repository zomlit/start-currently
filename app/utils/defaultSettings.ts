import {
  WidgetType,
  WidgetSettings,
  VisualizerSettings,
  ChatSettings,
  AlertsSettings,
} from "@/types";
import { defaultCommonSettings } from "@/types/initialWidgets";

export const defaultSettings: Record<WidgetType, WidgetSettings> = {
  visualizer: {
    commonSettings: defaultCommonSettings,
    specificSettings: {
      selectedSkin: "rounded",
      hideOnDisabled: false,
      pauseEnabled: false,
      showAlbumArt: true,
      showPlaylist: true,
      progressBarForegroundColor: "rgba(34, 19, 49, 0.8)",
      progressBarBackgroundColor: "rgba(255, 255, 255, 0.5)",
      colorSync: true,
      backgroundOpacity: 0.8,
      syncTextShadow: false,
    } as VisualizerSettings,
  },
  chat: {
    commonSettings: defaultCommonSettings,
    specificSettings: {
      showBadges: true,
      broadcastChannel: "",
      selectedUsername: "",
      showAvatars: true,
      showPlatform: true,
      chatSkin: "default",
      chatBubbleColor: "#ffffff",
      maxHeight: 300,
    } as ChatSettings,
  },
  alerts: {
    commonSettings: defaultCommonSettings,
    specificSettings: {
      alertType: "follower",
      duration: 5000,
      sound: true,
      volume: 50,
      animation: "fade",
      position: "top-left",
      showCustomText: false,
      customText: "",
      customTextColor: "#ffffff",
      titleColor: "#ffffff",
      matchArtworkColors: false,
      matchArtworkOpacity: 0.5,
    } as AlertsSettings,
  },
  game_stats: {
    commonSettings: defaultCommonSettings,
    specificSettings: {},
  },
  game_overlay: {
    commonSettings: defaultCommonSettings,
    specificSettings: {},
  },
  gamepad: {
    commonSettings: defaultCommonSettings,
    specificSettings: {},
  },
  timer: {
    commonSettings: defaultCommonSettings,
    specificSettings: {},
  },
  configure: {
    commonSettings: defaultCommonSettings,
    specificSettings: {},
  },
  freeform: {
    commonSettings: defaultCommonSettings,
    specificSettings: {
      content: "",
    },
  },
};

export const widgetTypes: readonly WidgetType[] = [
  "visualizer",
  "chat",
  "alerts",
  "game_stats",
  "game_overlay",
  "gamepad",
  "timer",
  "configure",
  "freeform",
];
