export const defaultGamepadSettings = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  buttonColor: "#ffffff",
  stickColor: "#ffffff",
  scale: 1,
  opacity: 1,
  selectedSkin: "ds4" as const,
  showButtonPresses: true,
  showAnalogSticks: true,
  showTriggers: true,
  buttonHighlightColor: "#ffffff",
  analogStickColor: "#ffffff",
  triggerColor: "#ffffff",
  labelColor: "#ffffff",
  labelBackgroundColor: "rgba(0, 0, 0, 0.5)",
  labelOpacity: 1,
  debugMode: false
} as const;

export type GamepadSettings = typeof defaultGamepadSettings; 