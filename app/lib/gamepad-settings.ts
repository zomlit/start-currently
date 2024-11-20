import type { ControllerType, ControllerColor } from "@/types/gamepad";
import IconBrandPlaystation from "@icons/filled/brand-playstation.svg?react";
import IconBrandXbox from "@icons/outline/brand-xbox.svg?react";
import IconBrandNintendo from "@icons/outline/device-nintendo.svg?react";
import IconBrand8BitDo from "@icons/filled/brand-8bitdo.svg?react";

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
  scale: 1,
  deadzone: 0.1,
  debugMode: false,
};

export type GamepadSettings = typeof defaultGamepadSettings;

export const CONTROLLER_TYPES: ControllerType[] = [
  {
    id: "ds4",
    name: "DualShock 4",
    brand: "PlayStation",
    icon: IconBrandPlaystation,
  },
  {
    id: "dualsense",
    name: "DualSense",
    brand: "PlayStation",
    icon: IconBrandPlaystation,
  },
  {
    id: "xbox-one",
    name: "Xbox One",
    brand: "Xbox",
    icon: IconBrandXbox,
  },
  {
    id: "xbox-series",
    name: "Xbox Series X|S",
    brand: "Xbox",
    icon: IconBrandXbox,
  },
  {
    id: "8bitdo-ultimate-c",
    name: "8BitDo (Coming Soon)",
    brand: "8BitDo",
    icon: IconBrand8BitDo,
    disabled: true,
  },
  {
    id: "switch-pro",
    name: "Switch Pro",
    brand: "Nintendo",
    icon: IconBrandNintendo,
  },
];

export const CONTROLLER_COLORS: ControllerColor[] = [
  { id: "white", name: "White", hex: "#FFFFFF", className: "white" },
  { id: "black", name: "Black", hex: "#000000", className: "black" },
  {
    id: "midnight-black",
    name: "Midnight Black",
    hex: "#1a1a1a",
    className: "midnight-black",
  },
  {
    id: "cosmic-red",
    name: "Cosmic Red",
    hex: "#cc0000",
    className: "cosmic-red",
  },
  {
    id: "starlight-blue",
    name: "Starlight Blue",
    hex: "#0066cc",
    className: "starlight-blue",
  },
  {
    id: "nova-pink",
    name: "Nova Pink",
    hex: "#ff69b4",
    className: "nova-pink",
  },
  {
    id: "galactic-purple",
    name: "Galactic Purple",
    hex: "#800080",
    className: "galactic-purple",
  },
  {
    id: "macho",
    name: "Miss Macho TV",
    hex: "#39FF14",
    className: "macho",
  },
];

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
  }
};
