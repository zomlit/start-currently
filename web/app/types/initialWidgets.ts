import { WidgetType, WidgetProfile, WidgetSettings } from "@/types";
import { v4 as uuidv4 } from "uuid";

export type Widget = {
  profiles: WidgetProfile[];
};

export const defaultCommonSettings: WidgetSettings["commonSettings"] = {};

export const initialWidgets: Record<WidgetType, Widget> = {
  visualizer: {
    profiles: [
      {
        id: uuidv4(),
        name: "Default Visualizer",
        widgetType: "visualizer",
        settings: {
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
          },
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
        id: uuidv4(),
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
