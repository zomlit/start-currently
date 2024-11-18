import React from "react";
import { Gamepad } from "lucide-react";
import type { GamepadState, GamepadSettings } from "@/types/gamepad";
import { cn } from "@/lib/utils";

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

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full" style={{ paddingBottom: "75%" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "controller active max-w-full max-h-full",
                settings?.controllerType || "ds4",
                settings?.controllerColor,
                "id-gamepad-0"
              )}
              style={{
                transform: `scale(${settings?.scale || 1})`,
                position: "relative",
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            >
              <div className="triggers">
                <span
                  className={cn("trigger left", buttons[6] && "pressed")}
                  data-name="button-left-shoulder-bottom"
                ></span>
                <span
                  className={cn("trigger right", buttons[7] && "pressed")}
                  data-name="button-right-shoulder-bottom"
                ></span>
                <span
                  className="trigger-button left"
                  data-name="button-left-shoulder-bottom-digital"
                ></span>
                <span
                  className="trigger-button right"
                  data-name="button-right-shoulder-bottom-digital"
                ></span>
                <span className="clear"></span>
              </div>

              <div className="bumpers">
                <span
                  className={cn("bumper left", buttons[4] && "pressed")}
                  data-name="button-left-shoulder-top"
                ></span>
                <span
                  className={cn("bumper right", buttons[5] && "pressed")}
                  data-name="button-right-shoulder-top"
                ></span>
                <span className="clear"></span>
              </div>

              <div className="touchpad" data-name="touch-pad"></div>
              <div className="meta" data-name="button-meta"></div>

              <div className="arrows">
                <span
                  className={cn("back", buttons[8] && "pressed")}
                  data-name="button-select"
                ></span>
                <span
                  className={cn("start", buttons[9] && "pressed")}
                  data-name="button-start"
                ></span>
                <span className="clear"></span>
              </div>

              <div className="abxy">
                <span
                  className={cn("button a", buttons[0] && "pressed")}
                  data-name="button-1"
                ></span>
                <span
                  className={cn("button b", buttons[1] && "pressed")}
                  data-name="button-2"
                ></span>
                <span
                  className={cn("button x", buttons[2] && "pressed")}
                  data-name="button-3"
                ></span>
                <span
                  className={cn("button y", buttons[3] && "pressed")}
                  data-name="button-4"
                ></span>
              </div>

              <div className="sticks">
                <span
                  className={cn("stick left", buttons[10] && "pressed")}
                  data-name="stick-1"
                  style={{
                    transform: `translate3d(${axes[0] * 20}px, ${axes[1] * 20}px, 0)`,
                    willChange: "transform",
                  }}
                ></span>
                <span
                  className={cn("stick right", buttons[11] && "pressed")}
                  data-name="stick-2"
                  style={{
                    transform: `translate3d(${axes[2] * 20}px, ${axes[3] * 20}px, 0)`,
                    willChange: "transform",
                  }}
                ></span>
              </div>

              <div className="dpad">
                <span
                  className={cn("face up", buttons[12] && "pressed")}
                  data-name="button-dpad-top"
                ></span>
                <span
                  className={cn("face down", buttons[13] && "pressed")}
                  data-name="button-dpad-bottom"
                ></span>
                <span
                  className={cn("face left", buttons[14] && "pressed")}
                  data-name="button-dpad-left"
                ></span>
                <span
                  className={cn("face right", buttons[15] && "pressed")}
                  data-name="button-dpad-right"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
