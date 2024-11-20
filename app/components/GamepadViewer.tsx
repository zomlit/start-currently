import React from "react";
import { cn } from "@/lib/utils";
import { Gamepad } from "lucide-react";
import DS4Base from "@/icons/gamepad/ds4-base.svg?react";
import MachoBase from "@/icons/gamepad/macho-base.svg?react";
import DS4Buttons from "@/icons/gamepad/ds4-base-buttons.svg?react";
import DS4Sticks from "@/icons/gamepad/ds4-sticks.svg?react";
import type {
  GamepadSettings,
  GamepadState,
  HookGamepadState,
} from "@/types/gamepad";
import { CONTROLLER_COLORS } from "@/lib/gamepad-settings";
import {
  CircleButton,
  CrossButton,
  SquareButton,
  TriangleButton,
} from "./gamepad/FaceButtons";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Bumper, Trigger } from "./gamepad/BumperTrigger";

const safeFormatColor = (color: any): string => {
  if (!color) return "rgba(0, 0, 0, 1)";

  // If it's a palette color object
  if (typeof color === "object" && color !== null) {
    if (typeof color.hex === "string") return color.hex;
    if (
      typeof color.r === "number" &&
      typeof color.g === "number" &&
      typeof color.b === "number"
    ) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`;
    }
    return "rgba(0, 0, 0, 1)";
  }

  if (typeof color !== "string") {
    return "rgba(0, 0, 0, 1)";
  }

  return color;
};

interface GamepadViewerProps {
  settings?: Partial<GamepadSettings>;
  username?: string;
  gamepadState?: GamepadState | null;
  isPublicView?: boolean;
}

export function GamepadViewer({
  settings,
  username,
  gamepadState,
  isPublicView = false,
}: GamepadViewerProps) {
  if (!gamepadState && settings?.showButtonPresses) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <Gamepad className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            {isPublicView
              ? "Waiting for controller input..."
              : "No Controller Detected"}
          </h3>
          <p className="text-sm text-muted-foreground/75">
            {isPublicView
              ? "Make sure the controller is connected and the overlay is active"
              : "Connect a controller and press any button"}
          </p>
        </div>
      </div>
    );
  }

  const buttons = gamepadState?.buttons || Array(16).fill(false);
  const axes = gamepadState?.axes || Array(4).fill(0);

  // Create CSS variables based on controller color
  const getControllerColors = () => {
    const selectedColor = CONTROLLER_COLORS.find(
      (color) => color.id === settings?.controllerColor
    );

    const colors = {
      "--button-color": settings?.buttonColor || "#ffffff",
    };

    switch (selectedColor?.id) {
      case "cosmic-red":
        return {
          ...colors,
          "--controller-primary-color": "#BE2434",
          "--controller-touchpad-color": "#AB1F2E",
          "--controller-button-area-color": "#9C1C2A",
          "--controller-stick-area-color": "#9C1C2A",
          "--controller-ps-button-color": "#2B2B2B",
        };
      case "white":
        return {
          ...colors,
          "--controller-primary-color": "#e8e8e8",
          "--controller-touchpad-color": "#f5f5f5",
          "--controller-button-area-color": "#e0e0e0",
          "--controller-stick-area-color": "#e0e0e0",
          "--controller-ps-button-color": "#2B2B2B",
        };
      case "black":
        return {
          ...colors,
          "--controller-primary-color": "#1a1a1a",
          "--controller-touchpad-color": "#2a2a2a",
          "--controller-button-area-color": "#202020",
          "--controller-stick-area-color": "#252525",
          "--controller-ps-button-color": "#303030",
        };
      case "midnight-black":
        return {
          ...colors,
          "--controller-primary-color": "#0a0a0a",
          "--controller-touchpad-color": "#1a1a1a",
          "--controller-button-area-color": "#101010",
          "--controller-stick-area-color": "#151515",
          "--controller-ps-button-color": "#202020",
        };
      case "starlight-blue":
        return {
          ...colors,
          "--controller-primary-color": "#0066cc",
          "--controller-touchpad-color": "#0077dd",
          "--controller-button-area-color": "#0055bb",
          "--controller-stick-area-color": "#0044aa",
          "--controller-ps-button-color": "#003399",
        };
      case "nova-pink":
        return {
          ...colors,
          "--controller-primary-color": "#ff69b4",
          "--controller-touchpad-color": "#ff79c4",
          "--controller-button-area-color": "#ff59a4",
          "--controller-stick-area-color": "#ff4994",
          "--controller-ps-button-color": "#ff3984",
        };
      case "galactic-purple":
        return {
          ...colors,
          "--controller-primary-color": "#800080",
          "--controller-touchpad-color": "#900090",
          "--controller-button-area-color": "#700070",
          "--controller-stick-area-color": "#600060",
          "--controller-ps-button-color": "#500050",
        };
      default:
        return {
          ...colors,
          "--controller-primary-color": "#1a1a1a",
          "--controller-touchpad-color": "#2a2a2a",
          "--controller-button-area-color": "#202020",
          "--controller-stick-area-color": "#252525",
          "--controller-ps-button-color": "#303030",
        };
    }
  };

  return (
    <div
      className="relative flex h-full w-full flex-col"
      style={
        {
          backgroundColor:
            safeFormatColor(settings?.backgroundColor) || "transparent",
          ...getControllerColors(),
          "--button-color": safeFormatColor(settings?.buttonColor) || "#ffffff",
          "--button-pressed-color":
            safeFormatColor(settings?.buttonPressedColor) || "#00ff00",
        } as React.CSSProperties
      }
    >
      <div className="flex-1 p-4">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Debug overlay - only show when debugMode is enabled */}
          {settings?.debugMode && (
            <div className="absolute top-2 left-2 z-50 rounded bg-black/80 p-2 text-xs text-white">
              <div className="space-y-1">
                <div>
                  Buttons:{" "}
                  {buttons
                    .map((b, i) => (b ? i : ""))
                    .filter(Boolean)
                    .join(", ")}
                </div>
                <div>
                  Left Stick: ({axes[0].toFixed(2)}, {axes[1].toFixed(2)})
                </div>
                <div>
                  Right Stick: ({axes[2].toFixed(2)}, {axes[3].toFixed(2)})
                </div>
                <div>Button Color: {settings?.buttonColor}</div>
                <div>Controller Color: {settings?.controllerColor}</div>
                <div>Scale: {settings?.scale}</div>
              </div>
            </div>
          )}

          {/* Controller render */}
          <div className="relative w-full" style={{ paddingBottom: "75%" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "controller",
                  settings?.controllerType || "ds4",
                  settings?.controllerColor,
                  "active"
                )}
                style={
                  {
                    transform: `scale(${settings?.scale || 1})`,
                    position: "relative",
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    "--button-color": settings?.buttonColor,
                  } as React.CSSProperties
                }
              >
                {/* Base Controller SVG - Switch between regular and macho base */}
                {settings?.controllerColor === "macho" ? (
                  <MachoBase className="absolute inset-0 w-full h-full" />
                ) : (
                  <DS4Base className="absolute inset-0 w-full h-full" />
                )}

                {/* Triggers */}
                <div className="triggers">
                  {settings?.showTriggers && (
                    <>
                      <div
                        className={cn("trigger left", buttons[6] && "pressed")}
                      >
                        <Trigger pressed={buttons[6]} />
                      </div>
                      <div
                        className={cn("trigger right", buttons[7] && "pressed")}
                      >
                        <Trigger pressed={buttons[7]} />
                      </div>
                    </>
                  )}
                </div>

                {/* Bumpers */}
                <div className="bumpers">
                  <div className={cn("bumper left", buttons[4] && "pressed")}>
                    <Bumper pressed={buttons[4]} />
                  </div>
                  <div className={cn("bumper right", buttons[5] && "pressed")}>
                    <Bumper pressed={buttons[5]} />
                  </div>
                </div>

                {/* Face Buttons */}
                <div className="abxy">
                  {settings?.showButtonPresses && (
                    <>
                      <div>
                        <CrossButton pressed={buttons[0]} />
                      </div>
                      <div>
                        <CircleButton pressed={buttons[1]} />
                      </div>
                      <div>
                        <SquareButton pressed={buttons[2]} />
                      </div>
                      <div>
                        <TriangleButton pressed={buttons[3]} />
                      </div>
                    </>
                  )}
                </div>

                {/* D-Pad */}
                <div className="dpad">
                  <div className={cn("face up", buttons[12] && "pressed")} />
                  <div className={cn("face down", buttons[13] && "pressed")} />
                  <div className={cn("face left", buttons[14] && "pressed")} />
                  <div className={cn("face right", buttons[15] && "pressed")} />
                </div>

                {/* Analog Sticks */}
                {settings?.showAnalogSticks && (
                  <div
                    className="sticks absolute"
                    style={{
                      top: "58%",
                      left: "25%",
                      width: "50%",
                      height: "20%",
                    }}
                  >
                    <div className="relative w-full h-full">
                      {/* Left Stick */}
                      <div
                        className="absolute"
                        style={{
                          bottom: "0",
                          left: "5%",
                          transform: `translate(${axes[0] * 20}px, calc(-50% + ${axes[1] * 20}px))`,
                          width: "26.04%",
                          height: "89.52%",
                        }}
                      >
                        <DS4Sticks
                          className={cn(
                            "w-full h-full",
                            buttons[10] && "pressed"
                          )}
                          style={
                            {
                              "--stick-color": buttons[10]
                                ? safeFormatColor(settings?.buttonPressedColor)
                                : safeFormatColor(settings?.stickColor),
                            } as React.CSSProperties
                          }
                        />
                      </div>

                      {/* Right Stick */}
                      <div
                        className="absolute"
                        style={{
                          right: "5%",
                          bottom: "0",
                          transform: `translate(${axes[2] * 20}px, calc(-50% + ${-axes[3] * 20}px))`,
                          width: "26.04%",
                          height: "89.52%",
                        }}
                      >
                        <DS4Sticks
                          className={cn(
                            "w-full h-full",
                            buttons[11] && "pressed"
                          )}
                          style={
                            {
                              "--stick-color": buttons[11]
                                ? safeFormatColor(settings?.buttonPressedColor)
                                : safeFormatColor(settings?.stickColor),
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Start/Select Buttons */}
                <div className="arrows">
                  <div className={cn("back", buttons[8] && "pressed")} />
                  <div className={cn("start", buttons[9] && "pressed")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
