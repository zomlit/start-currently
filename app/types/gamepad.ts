import type { Database } from './supabase';

type GamepadWidgetRow = Database['public']['Tables']['GamepadWidget']['Row'];

export interface GamepadState {
  buttons: boolean[];
  axes: number[];
}

export interface GamepadSettings {
  backgroundColor: string;
  buttonColor: string;
  stickColor: string;
  scale: number;
  opacity: number;
  selectedSkin: 'switch' | 'ds4' | 'xbox';
  showButtonPresses: boolean;
  showAnalogSticks: boolean;
  showTriggers: boolean;
  buttonHighlightColor: string;
  analogStickColor: string;
  triggerColor: string;
  labelColor: string;
  labelBackgroundColor: string;
  labelOpacity: number;
  debugMode: boolean;
}

export interface GamepadViewerProps {
  settings?: Partial<GamepadSettings>;
  username?: string;
  gamepadState?: GamepadState | null;
}

// Helper type for the gamepad_settings column
export type GamepadWidgetSettings = NonNullable<GamepadWidgetRow['gamepad_settings']>; 