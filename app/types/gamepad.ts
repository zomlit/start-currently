import type { Database } from "./supabase";
import type { FunctionComponent, SVGProps } from "react";

type GamepadWidgetRow = Database["public"]["Tables"]["GamepadWidget"]["Row"];

export interface GamepadState {
  buttons: boolean[];
  axes: number[];
}

export interface HookGamepadState {
  buttons: {
    pressed: boolean;
    value: number;
  }[];
  axes: number[];
  timestamp: number;
}

export interface GamepadSettings {
  controllerType: string;
  controllerColor: string;
  showButtonPresses: boolean;
  showAnalogSticks: boolean;
  showTriggers: boolean;
  buttonColor: string;
  stickColor: string;
  triggerColor: string;
  backgroundColor: string;
  scale: number;
  deadzone: number;
  debugMode: boolean;
}

export interface GamepadViewerProps {
  settings?: Partial<GamepadSettings>;
  username?: string;
  gamepadState?: GamepadState | null;
}

// Helper type for the gamepad_settings column
export type GamepadWidgetSettings = NonNullable<
  GamepadWidgetRow["gamepad_settings"]
>;

export interface ControllerType {
  id: string;
  name: string;
  brand: string;
  icon: FunctionComponent<SVGProps<SVGElement>>;
  disabled?: boolean;
}

export interface ControllerColor {
  id: string;
  name: string;
  hex: string;
  className: string;
}
