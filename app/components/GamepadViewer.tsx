import React from "react";
import { cn } from "@/lib/utils";
import { Gamepad } from "lucide-react";
import DS4Base from "@/icons/gamepad/ds4-base.svg?react";
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
  if (!gamepadState) {
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

  const { buttons, axes } = gamepadState;

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
      className="relative flex h-full w-full items-center justify-center p-4"
      style={
        {
          backgroundColor: settings?.backgroundColor || "transparent",
          ...getControllerColors(),
          "--button-color": settings?.buttonColor || "#ffffff",
        } as React.CSSProperties
      }
    >
      <div className="relative w-full h-full flex items-center justify-center">
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
                  "--button-color": settings?.buttonColor || "#ffffff",
                } as React.CSSProperties
              }
            >
              {/* Base Controller SVG */}
              <DS4Base className="absolute inset-0 w-full h-full" />

              {/* Triggers */}
              <div className="triggers">
                {settings?.showTriggers && (
                  <>
                    <div
                      className={cn("trigger left", buttons[6] && "pressed")}
                      style={{ backgroundColor: settings.triggerColor }}
                    />
                    <div
                      className={cn("trigger right", buttons[7] && "pressed")}
                      style={{ backgroundColor: settings.triggerColor }}
                    />
                  </>
                )}
              </div>

              {/* Bumpers */}
              <div className="bumpers">
                <div className={cn("bumper left", buttons[4] && "pressed")} />
                <div className={cn("bumper right", buttons[5] && "pressed")} />
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
                    top: "51.42%",
                    left: "28.28%",
                    width: "44.78%",
                    height: "17.53%",
                  }}
                >
                  <div className="relative w-full h-full">
                    {/* Left Stick */}
                    <div
                      className="absolute left-0 top-0"
                      style={{
                        width: "26.04%",
                        height: "89.52%",
                        transform: `translate(${axes[0] * 20}px, ${axes[1] * 20}px)`,
                      }}
                    >
                      <DS4Sticks
                        className={cn(
                          "w-full h-full",
                          buttons[10] && "pressed"
                        )}
                        style={
                          {
                            "--stick-color": settings?.stickColor || "#1a1a1a",
                          } as React.CSSProperties
                        }
                      />
                    </div>

                    {/* Right Stick */}
                    <div
                      className="absolute right-0 bottom-0"
                      style={{
                        width: "26.04%",
                        height: "89.52%",
                        transform: `translate(${axes[2] * 20}px, ${axes[3] * 20}px)`,
                      }}
                    >
                      <DS4Sticks
                        className={cn(
                          "w-full h-full",
                          buttons[11] && "pressed"
                        )}
                        style={
                          {
                            "--stick-color": settings?.stickColor || "#1a1a1a",
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
  );
}
