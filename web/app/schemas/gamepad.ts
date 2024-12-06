import { z } from "zod";

export const gamepadSettingsSchema = z.object({
  controllerType: z.string(),
  controllerColor: z.string(),
  showButtonPresses: z.boolean(),
  showAnalogSticks: z.boolean(),
  showTriggers: z.boolean(),
  buttonColor: z.string(),
  buttonPressedColor: z.string(),
  stickColor: z.string(),
  triggerColor: z.string(),
  backgroundColor: z.string(),
  scale: z.number().min(0.1).max(2),
  deadzone: z.number().min(0).max(0.4),
  debugMode: z.boolean(),
  useCustomShapeColors: z.boolean(),
  buttonShapeColor: z.string(),
  buttonShapePressedColor: z.string(),
  hideWhenInactive: z.boolean(),
  inactivityTimeout: z.number().min(1).max(60),
});

export type GamepadSettings = z.infer<typeof gamepadSettingsSchema>;
