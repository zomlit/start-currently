import type { Database } from "./supabase";
import type { FunctionComponent, SVGProps } from "react";

type GamepadWidgetRow = Database["public"]["Tables"]["GamepadWidget"]["Row"];

export interface GamepadButtonState {
  pressed: boolean;
  value: number;
}

export interface GamepadState {
  buttons: GamepadButtonState[];
  axes: number[];
  timestamp?: number;
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
  buttonPressedColor: string;
  stickColor: string;
  triggerColor: string;
  backgroundColor: string;
  scale: number;
  deadzone: number;
  debugMode: boolean;
  useCustomShapeColors?: boolean;
  buttonShapeColor?: string;
  buttonShapePressedColor?: string;
  hideWhenInactive: boolean;
  inactivityTimeout: number;
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

export interface GamepadButton {
  pressed: boolean;
  touched: boolean;
  value: number;
}

export function isGamepadButtonState(
  button: { pressed: boolean } | boolean
): button is { pressed: boolean } {
  return typeof button === "object" && "pressed" in button;
}
