import { WidgetType, WidgetProfile, WidgetSettings } from "@/types";

// Remove this import
// import { v4 as uuidv4 } from "uuid";

export type Widget = {
  profiles: WidgetProfile[];
};

export const defaultCommonSettings: WidgetSettings["commonSettings"] = {
  backgroundColor: "rgba(128, 0, 128, 0.6)",
  textColor: "rgba(255, 255, 255, 1)",
  fontFamily: "Poppins, sans-serif",
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
};

export const initialWidgets: Record<WidgetType, Widget> = {
  visualizer: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Visualizer",
        widgetType: "visualizer",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  chat: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Chat",
        widgetType: "chat",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  alerts: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Alerts",
        widgetType: "alerts",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  game_stats: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Game Stats",
        widgetType: "game_stats",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  game_overlay: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Game Overlay",
        widgetType: "game_overlay",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  gamepad: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Gamepad",
        widgetType: "gamepad",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  timer: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Timer",
        widgetType: "timer",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  configure: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Configure",
        widgetType: "configure",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
  freeform: {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Default Freeform",
        widgetType: "freeform",
        settings: {
          commonSettings: defaultCommonSettings,
          specificSettings: {},
        },
        color: "#000000",
        is_current: true,
        is_active: true,
      },
    ],
  },
};
