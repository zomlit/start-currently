import { z } from "zod";
import type { ControllerType, ControllerColor } from "@/types/gamepad";
import IconBrandPlaystation from "@icons/filled/brand-playstation.svg?react";
import IconBrandXbox from "@icons/outline/brand-xbox.svg?react";
import IconBrandNintendo from "@icons/outline/device-nintendo.svg?react";
import IconBrand8BitDo from "@icons/filled/brand-8bitdo.svg?react";

// Schema definitions
export const gamepadSchema = z.object({
  controllerType: z.string().default("ds4"),
  controllerColor: z.string().default("white"),
  showButtonPresses: z.boolean().default(true),
  showAnalogSticks: z.boolean().default(true),
  showTriggers: z.boolean().default(true),
  buttonColor: z.string().default("#1a1a1a"),
  buttonPressedColor: z.string().default("#000000"),
  stickColor: z.string().default("#1a1a1a"),
  triggerColor: z.string().default("#1a1a1a"),
  backgroundColor: z.string().default("transparent"),
  scale: z.number().min(0.1).max(2).default(0.9),
  deadzone: z.number().min(0).max(1).default(0.1),
  debugMode: z.boolean().default(false),
  hideWhenInactive: z.boolean().default(false),
  inactivityTimeout: z.number().min(1).max(60).default(10),
});

// Types
export type GamepadSettings = z.infer<typeof gamepadSchema>;

// Default settings
export const defaultGamepadSettings: GamepadSettings = {
  controllerType: "ds4",
  controllerColor: "white",
  showButtonPresses: true,
  showAnalogSticks: true,
  showTriggers: true,
  buttonColor: "#1a1a1a",
  buttonPressedColor: "#000000",
  stickColor: "#1a1a1a",
  triggerColor: "#1a1a1a",
  backgroundColor: "transparent",
  scale: 0.9,
  deadzone: 0.1,
  debugMode: false,
  hideWhenInactive: false,
  inactivityTimeout: 10,
};

// Constants
export const CONTROLLER_TYPES: ControllerType[] = [
  {
    id: "ds4",
    name: "DualShock 4",
    brand: "PlayStation",
    icon: IconBrandPlaystation,
  },
  // ... rest of controller types
];

export const CONTROLLER_COLORS: ControllerColor[] = [
  { id: "white", name: "White", hex: "#FFFFFF", className: "white" },
  // ... rest of colors
];

// Helper functions
export const getControllerColors = (colorId: string) => {
  switch (colorId) {
    case "macho":
      return {
        "--controller-primary-color": "#0d0e13",
        "--controller-touchpad-color": "#39FF14",
        "--controller-button-area-color": "#800080",
        "--controller-stick-area-color": "#39FF14",
        "--controller-ps-button-color": "#800080",
      };
    default:
      return {};
  }
};
