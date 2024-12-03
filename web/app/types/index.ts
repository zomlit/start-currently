export * from "./widget";
export * from "./profile";
export * from "./chat";
export * from "./spotify";
export * from "./checkout";
export * from "./commands";
export * from "./fontPicker";
export * from "./teamPicker";
export * from "./supabase";
export * from "./commonSettings";
export * from "./initialWidgets";
export type { Widget } from "./widget";

export interface WidgetSettings {
  commonSettings: {
    fontFamily?: string;
    fontVariant?: string;
    fontSize?: number;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderStyle?: string;
    borderRadius?: number;
    borderWidth?: number;
    padding?: number;
    gap?: number;
    backgroundOpacity?: number;
    syncTextShadow?: boolean;
    enableTextShadow?: boolean;
    textShadowColor?: string;
    textShadowHorizontal?: number;
    textShadowVertical?: number;
    textShadowBlur?: number;
    colorSync?: boolean;
    fontWeight?: string;
  };
  specificSettings: {
    backgroundOpacity?: number;
    syncTextShadow?: boolean;
    enableTextShadow?: boolean;
    textShadowColor?: string;
    textShadowHorizontal?: number;
    textShadowVertical?: number;
    textShadowBlur?: number;
    colorSync?: boolean;
    // ... other specific settings
  };
}

export interface ProfileSettings {
  commonSettings: {
    // ... common settings properties
  };
  specificSettings: {
    // ... specific settings properties
  };
}
