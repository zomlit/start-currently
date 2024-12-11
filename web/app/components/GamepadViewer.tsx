import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import {
  Gamepad,
  Gamepad2,
  Gauge,
  Crosshair,
  Circle,
  X,
  Chrome,
  Download,
} from "lucide-react";
import DS4Base from "@/icons/gamepad/ds4-base.svg?react";
import MachoBase from "@/icons/gamepad/macho-base.svg?react";
import DS4Buttons from "@/icons/gamepad/ds4-base-buttons.svg?react";
import DS4Sticks from "@/icons/gamepad/ds4-sticks.svg?react";
import type {
  GamepadSettings,
  GamepadState,
  HookGamepadState,
  GamepadButtonState,
} from "@/types/gamepad";
import { CONTROLLER_COLORS } from "@/lib/gamepad-settings";
import {
  CircleButton,
  CrossButton,
  SquareButton,
  TriangleButton,
} from "./gamepad/FaceButtons";
import { GradientColorPicker } from "@/components/GradientColorPicker";
import { Bumper } from "./gamepad/BumperTrigger";
import { useRawGamepad } from "@/hooks/useRawGamepad";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/toast";
import { AnimatePresence, motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DPad } from "./gamepad/DPad";
import { Triggers } from "./gamepad/Triggers";
import { useGamepadContext } from "@/providers/GamepadProvider";
import type { ReactElement } from "react";
import { WidgetCTA } from "./WidgetCTA";

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
  settings: GamepadSettings;
  username?: string;
  gamepadState: GamepadState | null;
  isPublicView?: boolean;
  disableDirectInput?: boolean;
  onSettingsChange?: (settings: Partial<GamepadSettings>) => void;
  onDebugToggle?: () => void;
}

// Update the formatStickValue function to show 2 decimal places
const formatStickValue = (value: number): string => {
  return value.toFixed(2);
};

// Add a helper to check if stick value exceeds deadzone
const checkStickDrift = (value: number, deadzone: number = 0.05): boolean => {
  return Math.abs(value) > deadzone;
};

// Add helper for calibration
const calculateRecommendedDeadzone = (axes: number[]): number => {
  const maxDrift = Math.max(...axes.map((axis) => Math.abs(axis)));
  // Add a small buffer to the detected drift
  return Math.min(Math.ceil(maxDrift * 100) / 100 + 0.02, 0.4);
};

// Helper to identify which sticks are drifting
const getDriftingSticks = (axes: number[], threshold: number = 0.01) => {
  const drifts = {
    left: Math.max(Math.abs(axes[0]), Math.abs(axes[1])),
    right: Math.max(Math.abs(axes[2]), Math.abs(axes[3])),
  };

  return {
    left: drifts.left > threshold,
    right: drifts.right > threshold,
    maxLeft: drifts.left.toFixed(3),
    maxRight: drifts.right.toFixed(3),
  };
};

// Add hysteresis to prevent rapid state changes
const HYSTERESIS_FACTOR = 1.1;
const MIN_CHANGE_THRESHOLD = 0.01;

// Centralize drift detection logic
const useStickDriftDetection = (axes: number[], deadzone: number) => {
  const [driftState, setDriftState] = useState({
    isDrifting: false,
    leftStickDrift: 0,
    rightStickDrift: 0,
  });

  const prevAxesRef = useRef(axes);
  const prevDeadzoneRef = useRef(deadzone);

  useEffect(() => {
    // Only update if axes or deadzone actually changed
    if (
      axes.some((axis, i) => axis !== prevAxesRef.current[i]) ||
      deadzone !== prevDeadzoneRef.current
    ) {
      const leftStickDrift = Math.max(Math.abs(axes[0]), Math.abs(axes[1]));
      const rightStickDrift = Math.max(Math.abs(axes[2]), Math.abs(axes[3]));

      // Use hysteresis for more stable drift detection
      const isDrifting =
        leftStickDrift > deadzone * HYSTERESIS_FACTOR ||
        rightStickDrift > deadzone * HYSTERESIS_FACTOR;

      setDriftState((prev) => {
        const shouldUpdate =
          Math.abs(prev.leftStickDrift - leftStickDrift) >
            MIN_CHANGE_THRESHOLD ||
          Math.abs(prev.rightStickDrift - rightStickDrift) >
            MIN_CHANGE_THRESHOLD ||
          prev.isDrifting !== isDrifting;

        return shouldUpdate
          ? { isDrifting, leftStickDrift, rightStickDrift }
          : prev;
      });

      // Update refs
      prevAxesRef.current = axes;
      prevDeadzoneRef.current = deadzone;
    }
  }, [axes, deadzone]);

  return driftState;
};

// Update status determination functions
const getDriftValueColor = (drift: number, deadzone: number) => {
  if (drift > deadzone * HYSTERESIS_FACTOR) return "text-red-400";
  if (drift > deadzone) return "text-yellow-400";
  return "text-green-400";
};

// Add a helper for tracking value history
interface DriftHistory {
  values: number[];
  timestamp: number;
}

// Update status text to use averaged values
const getDriftStatusText = (drift: number, deadzone: number) => {
  const driftPercentage = ((drift / deadzone) * 100).toFixed(1);

  if (drift > deadzone) {
    return { text: "Drift Detected", color: "text-red-400" };
  }
  if (drift > deadzone - 0.01) {
    return {
      text: `Potential Drift (${driftPercentage}%)`,
      color: "text-yellow-400",
    };
  }
  return { text: "OK", color: "text-green-400" };
};

// Simplify hasAnyDrift to use the same logic
const hasAnyDrift = (axes: number[], deadzone: number): boolean => {
  const leftDrift = Math.max(Math.abs(axes[0]), Math.abs(axes[1]));
  const rightDrift = Math.max(Math.abs(axes[2]), Math.abs(axes[3]));

  return leftDrift > deadzone || rightDrift > deadzone;
};

// Update the deadzone display color logic to match drift detection
const getDeadzoneDisplayColor = (
  value: number | undefined,
  axes: number[]
): string => {
  if (!value || !axes) return "text-muted-foreground";

  // Get max drift values for each stick
  const leftDrift = Math.max(Math.abs(axes[0]), Math.abs(axes[1]));
  const rightDrift = Math.max(Math.abs(axes[2]), Math.abs(axes[3]));

  // If any stick is showing drift, show red
  if (leftDrift > value || rightDrift > value) {
    return "text-red-500";
  }

  // If any stick is near the threshold, show yellow
  if (leftDrift > value - 0.01 || rightDrift > value - 0.01) {
    return "text-yellow-500";
  }

  // Otherwise show green
  return "text-emerald-500";
};

// Update DeadzoneVisualizer with better styling and layout
const DeadzoneVisualizer = ({
  x,
  y,
  deadzone,
}: {
  x: number;
  y: number;
  deadzone: number;
}) => {
  const scale = 180;
  const constrainedX = Math.max(-1, Math.min(1, x));
  const constrainedY = Math.max(-1, Math.min(1, y));

  const translateX = constrainedX * (scale / 2);
  const translateY = constrainedY * (scale / 2);

  const currentPosition = Math.max(Math.abs(x), Math.abs(y));

  // Simplified status color logic to match drift detection
  const getStatusColor = () => {
    if (currentPosition > deadzone) return "red";
    if (currentPosition > deadzone - 0.01) return "yellow";
    return "emerald";
  };

  const statusColor = getStatusColor();
  const colorMap = {
    red: "bg-red-500/50",
    yellow: "bg-yellow-500/50",
    emerald: "bg-emerald-500/50",
  };

  const squareSize = scale * deadzone * 2;
  const bracketSize = squareSize * 0.15;

  return (
    <div className="relative h-52 w-52">
      {/* Background circle */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-200",
          statusColor === "red"
            ? "border-red-500/20"
            : statusColor === "yellow"
              ? "border-yellow-500/20"
              : "border-violet-500/20"
        )}
        style={{
          width: `${scale * 1.1}px`,
          height: `${scale * 1.1}px`,
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)",
        }}
      />
      {/* Trail line */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 origin-left h-[2px]",
          statusColor === "red"
            ? "bg-red-500/40"
            : statusColor === "yellow"
              ? "bg-yellow-500/40"
              : "bg-emerald-500/40"
        )}
        style={{
          width: `${Math.sqrt(translateX * translateX + translateY * translateY)}px`,
          transform: `rotate(${Math.atan2(translateY, translateX)}rad)`,
          willChange: "transform, width",
          transition: "none",
        }}
      />
      {/* Crosshair lines */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 w-[1px] transition-colors duration-200",
          statusColor === "red"
            ? "bg-red-400/30"
            : statusColor === "yellow"
              ? "bg-yellow-400/30"
              : "bg-violet-400/30"
        )}
        style={{
          height: `${squareSize}px`,
          boxShadow: "0 0 4px rgba(0,0,0,0.1)",
        }}
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-y-1/2 h-[1px] transition-colors duration-200",
          statusColor === "red"
            ? "bg-red-400/30"
            : statusColor === "yellow"
              ? "bg-yellow-400/30"
              : "bg-violet-400/30"
        )}
        style={{
          width: `${squareSize}px`,
          boxShadow: "0 0 4px rgba(0,0,0,0.1)",
        }}
      />
      {/* Corner brackets */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${squareSize}px`,
          height: `${squareSize}px`,
        }}
      >
        {["top-left", "top-right", "bottom-left", "bottom-right"].map(
          (position) => (
            <div
              key={position}
              className={cn(
                "absolute border-[1.5px] transition-colors duration-200",
                statusColor === "red"
                  ? "border-red-400/50"
                  : statusColor === "yellow"
                    ? "border-yellow-400/50"
                    : "border-violet-400/50",
                position.includes("top") ? "top-0" : "bottom-0",
                position.includes("left") ? "left-0" : "right-0",
                position.includes("top") ? "border-t" : "border-b",
                position.includes("left") ? "border-l" : "border-r"
              )}
              style={{
                width: bracketSize,
                height: bracketSize,
                boxShadow: "0 0 4px rgba(0,0,0,0.1)",
              }}
            />
          )
        )}
      </div>
      {/* Position indicator */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 h-5 w-5 rounded-full transition-colors duration-200",
          colorMap[statusColor],
          "shadow-lg -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm",
          "ring-[1.5px] ring-offset-1 ring-offset-black/10",
          {
            "ring-red-500/70": statusColor === "red",
            "ring-yellow-500/70": statusColor === "yellow",
            "ring-emerald-500/70": statusColor === "emerald",
          }
        )}
        style={{
          transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`,
          willChange: "transform",
          transition: "none",
          boxShadow: `0 0 10px ${
            statusColor === "red"
              ? "rgba(239, 68, 68, 0.4)"
              : statusColor === "yellow"
                ? "rgba(234, 179, 8, 0.4)"
                : "rgba(16, 185, 129, 0.4)"
          }`,
        }}
      />
    </div>
  );
};

// Update the drift detection to be more strict about safe values
const hasAnyPotentialDrift = (axes: number[], deadzone: number): boolean => {
  const leftDrift = Math.max(Math.abs(axes[0]), Math.abs(axes[1]));
  const rightDrift = Math.max(Math.abs(axes[2]), Math.abs(axes[3]));

  // Consider it safe (no drift) when values are well below deadzone
  const safeMargin = 0.03; // Increased from 0.01 to 0.03
  const isSafe =
    leftDrift < deadzone - safeMargin && rightDrift < deadzone - safeMargin;

  // Only enable calibration when we're definitely not in a safe state
  return !isSafe;
};

// Add getStableDriftValue function definition
const getStableDriftValue = (drift: number): string => {
  return drift.toFixed(3);
};

const GAMEPAD_UPDATE_INTERVAL = 1000 / 60; // 60fps update rate
const MOVEMENT_THRESHOLD = 0.01; // Minimum change to consider movement

const hasSignificantChange = (
  currentState: GamepadState,
  lastState: GamepadState | null
): boolean => {
  if (!lastState) return true;

  // Check if any button state changed
  const buttonChanged = currentState.buttons.some(
    (button, i) => button !== lastState.buttons[i]
  );
  if (buttonChanged) return true;

  // Check if any axis moved more than threshold
  const axisChanged = currentState.axes.some(
    (axis, i) =>
      Math.abs((axis || 0) - (lastState.axes[i] || 0)) > MOVEMENT_THRESHOLD
  );
  return axisChanged;
};

const PS_BUTTON_COLORS = {
  cross: "#5989FF", // Blue
  circle: "#FF4242", // Red
  square: "#FF4FD0", // Pink
  triangle: "#7FFF4F", // Green
};

export function GamepadViewer({
  settings,
  username,
  gamepadState,
  isPublicView = false,
  disableDirectInput = false,
  onSettingsChange,
  onDebugToggle,
}: GamepadViewerProps): ReactElement {
  const { gamepadState: contextGamepadState, isConnected } =
    useGamepadContext();
  const { axes: rawAxes, isUserInteracting } = useRawGamepad();

  // State hooks
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [driftHistory, setDriftHistory] = useState<{
    left: DriftHistory;
    right: DriftHistory;
  }>({
    left: { values: [], timestamp: Date.now() },
    right: { values: [], timestamp: Date.now() },
  });

  const [extensionError, setExtensionError] = useState<string | null>(null);

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data.source !== "GAMEPAD_EXTENSION") return;

      switch (event.data.type) {
        case "EXTENSION_ERROR":
          if (event.data.error?.message === "Monitoring is disabled") {
            setExtensionError(null);
          } else {
            setExtensionError(
              event.data.error?.message || "Extension communication failed"
            );
            toast.error(
              "Gamepad extension error: " + event.data.error?.message
            );
          }
          break;
        case "MONITORING_STATE_CHANGED":
          if (event.data.enabled) {
            setExtensionError(null);
          }
          break;
        case "CONTENT_SCRIPT_READY":
          setExtensionError(null);
          console.log("Extension connected with ID:", event.data.extensionId);
          break;
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, []);

  // Refs
  const buttonStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Derived values
  const deadzone = settings?.deadzone ?? 0.05;

  // All useMemo hooks
  const finalGamepadState = useMemo(() => {
    const state = gamepadState || contextGamepadState;
    if (!state) return null;
    return {
      buttons: state.buttons.map((button: any, index: number) => ({
        pressed: typeof button === "object" ? button.pressed : !!button,
        value:
          index === 6 || index === 7
            ? typeof button === "object"
              ? button.value
              : button
                ? 1
                : 0
            : (typeof button === "object" ? button.pressed : !!button)
              ? 1
              : 0,
      })),
      axes: state.axes,
      timestamp: Date.now(),
    };
  }, [gamepadState, contextGamepadState]);

  const axes = useMemo(() => {
    return isPublicView ? finalGamepadState?.axes || Array(4).fill(0) : rawAxes;
  }, [isPublicView, finalGamepadState?.axes, rawAxes]);

  const buttons = useMemo(() => {
    if (!finalGamepadState?.buttons)
      return Array(16).fill({ pressed: false, value: 0 });
    return finalGamepadState.buttons.map((button) => ({
      pressed: typeof button === "object" ? button.pressed : !!button,
      value: typeof button === "object" ? button.value : button ? 1 : 0,
    }));
  }, [finalGamepadState?.buttons]);

  // Custom hooks
  const { isDrifting, leftStickDrift, rightStickDrift } =
    useStickDriftDetection(axes, deadzone);

  // Callbacks
  const handleCalibrate = useCallback(() => {
    if (!onSettingsChange) return;
    setIsDialogOpen(true);
  }, [onSettingsChange]);

  // Effects
  useEffect(() => {
    if (disableDirectInput) return;
    const newState = hasAnyPotentialDrift(axes, deadzone);
    if (buttonStateTimeoutRef.current) {
      clearTimeout(buttonStateTimeoutRef.current);
    }
    buttonStateTimeoutRef.current = setTimeout(() => {
      setIsButtonEnabled(newState);
    }, 200);
    return () => {
      if (buttonStateTimeoutRef.current) {
        clearTimeout(buttonStateTimeoutRef.current);
      }
    };
  }, [axes, deadzone, disableDirectInput]);

  useEffect(() => {
    const now = Date.now();
    const historyWindow = 1000;
    setDriftHistory((prev) => {
      const leftDrift = Math.max(Math.abs(axes[0]), Math.abs(axes[1]));
      const rightDrift = Math.max(Math.abs(axes[2]), Math.abs(axes[3]));
      const cleanup = (history: DriftHistory) => ({
        values: [
          ...history.values.filter(
            () => now - history.timestamp < historyWindow
          ),
          leftDrift,
        ],
        timestamp: now,
      });
      return {
        left: cleanup(prev.left),
        right: cleanup(prev.right),
      };
    });
  }, [axes]);

  // Debug effect
  useEffect(() => {
    if (finalGamepadState) {
      console.log("GamepadViewer state update:", {
        buttons: finalGamepadState.buttons.map((b) => b.pressed),
        axes: finalGamepadState.axes,
        timestamp: finalGamepadState.timestamp,
      });
    }
  }, [finalGamepadState]);

  const getAveragedDrift = (history: DriftHistory) => {
    if (history.values.length === 0) return 0;
    // Bias towards higher values to prevent rapid state changes
    const sortedValues = [...history.values].sort((a, b) => b - a);
    return sortedValues[Math.floor(sortedValues.length * 0.25)] || 0;
  };

  // Use averaged values for status display
  const leftStatus = getDriftStatusText(
    getAveragedDrift(driftHistory.left),
    deadzone
  );
  const rightStatus = getDriftStatusText(
    getAveragedDrift(driftHistory.right),
    deadzone
  );

  // Calculate current drift values inside the dialog component
  const CalibrationDialog = useMemo(() => {
    const currentDriftInfo = {
      left: Math.max(Math.abs(axes[0]), Math.abs(axes[1])),
      right: Math.max(Math.abs(axes[2]), Math.abs(axes[3])),
      maxLeft: getStableDriftValue(
        Math.max(Math.abs(axes[0]), Math.abs(axes[1]))
      ),
      maxRight: getStableDriftValue(
        Math.max(Math.abs(axes[2]), Math.abs(axes[3]))
      ),
    };

    const recommendedDeadzone = calculateRecommendedDeadzone(axes);

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Gauge className="h-5 w-5 text-violet-500" />
              Deadzone Calibration
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Current Stick Values:
                </p>
                <div className="space-y-2 rounded-md bg-muted p-3 text-sm">
                  {/* Always show both sticks */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Left Stick:</span>
                    <span
                      className={cn(
                        "font-medium text-lg",
                        currentDriftInfo.left > deadzone
                          ? "text-red-500"
                          : currentDriftInfo.left > deadzone - 0.01
                            ? "text-yellow-500"
                            : "text-emerald-500"
                      )}
                    >
                      {currentDriftInfo.maxLeft}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Right Stick:</span>
                    <span
                      className={cn(
                        "font-medium text-lg",
                        currentDriftInfo.right > deadzone
                          ? "text-red-500"
                          : currentDriftInfo.right > deadzone - 0.01
                            ? "text-yellow-500"
                            : "text-emerald-500"
                      )}
                    >
                      {currentDriftInfo.maxRight}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Deadzone Settings:
                  </p>
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current:
                      </span>
                      <span className="font-normal text-foreground/75 text-lg">
                        {deadzone.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Recommended:
                      </span>
                      <span className="font-black text-violet-500 text-lg">
                        {recommendedDeadzone.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status message */}
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {currentDriftInfo.left > deadzone ||
                    currentDriftInfo.right > deadzone
                      ? "Drift detected. Increasing the deadzone may help stabilize your controller."
                      : "No significant drift detected. Current deadzone appears stable."}
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                onSettingsChange?.({ deadzone: recommendedDeadzone });
                setIsDialogOpen(false);
              }}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              Apply Recommended Setting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [isDialogOpen, axes, deadzone, onSettingsChange]);

  if (!finalGamepadState) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <Gamepad className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <h3 className="text-lg font-blac text-muted-foreground text-center">
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

  // Update the button rendering logic
  const renderButton = (index: number, ButtonComponent: any) => {
    const buttonState = finalGamepadState?.buttons[index];
    const isPressed =
      typeof buttonState === "object" ? buttonState.pressed : !!buttonState;

    // Use custom colors only when enabled
    const buttonColor = settings?.useCustomShapeColors
      ? settings?.buttonShapeColor
      : getDefaultButtonColor(index);
    const pressedColor = settings?.useCustomShapeColors
      ? settings?.buttonShapePressedColor
      : settings?.buttonPressedColor;

    return (
      <ButtonComponent
        pressed={isPressed}
        color={buttonColor || "#1a1a1a"}
        pressedColor={pressedColor || "#ffffff"}
      />
    );
  };

  // Add helper function to get default button colors
  const getDefaultButtonColor = (buttonIndex: number): string => {
    switch (buttonIndex) {
      case 0: // Cross
        return PS_BUTTON_COLORS.cross;
      case 1: // Circle
        return PS_BUTTON_COLORS.circle;
      case 2: // Square
        return PS_BUTTON_COLORS.square;
      case 3: // Triangle
        return PS_BUTTON_COLORS.triangle;
      default:
        return "#1a1a1a";
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {CalibrationDialog}
      <div
        className="relative flex-1 w-full h-full"
        style={
          {
            backgroundColor:
              safeFormatColor(settings?.backgroundColor) || "transparent",
            ...getControllerColors(),
            "--button-color":
              safeFormatColor(settings?.buttonColor) || "#ffffff",
            "--button-pressed-color":
              safeFormatColor(settings?.buttonPressedColor) || "#00ff00",
          } as React.CSSProperties
        }
      >
        <WidgetCTA
          className=""
          title="Chrome Extension"
          description={
            extensionError
              ? `Extension error: ${extensionError}. Please check if the extension is installed and enabled.`
              : "Install our Chrome extension to keep gamepad inputs working when minimized (great for dual streaming setups!)"
          }
          icon={Chrome}
          primaryAction={{
            label: extensionError
              ? "Troubleshoot Extension"
              : "Download Extension",
            icon: Download,
            onClick: () =>
              window.open(
                extensionError && window.chrome?.runtime?.id
                  ? `chrome://extensions/?id=${window.chrome.runtime.id}`
                  : import.meta.env.VITE_CHROME_STORE_URL ||
                      "https://livestreaming.tools/downloads/currently-gamepad-tracker.zip",
                "_blank"
              ),
          }}
        />

        <div className="w-full h-full flex items-center justify-center lg:min-h-[687px]">
          {/* Debug overlay with animation */}
          <AnimatePresence>
            {settings?.debugMode && !isPublicView && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  top: 0,
                  zIndex: 50,
                  width: "100%",
                  padding: "1.5rem",
                }}
                className="bg-gradient/25 shadow-2xl backdrop-opacity-60 backdrop-invert dark:bg-black/95 bg-white/95"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground">
                      Deadzone Tester
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Monitor stick drift and calibrate your controller
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={handleCalibrate}
                      className="bg-violet-600 text-white hover:bg-violet-700"
                    >
                      <Crosshair className="mr-2 h-4 w-4" />
                      Calibrate
                    </Button>
                    <Button size="sm" variant="outline" onClick={onDebugToggle}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stick Information */}
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {/* Left Stick */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-violet-400">
                      {/* <Gauge className="h-4 w-4" />
                      <span>Left Stick</span> */}
                    </div>
                    <div className="flex justify-center">
                      <DeadzoneVisualizer
                        x={axes[0]}
                        y={axes[1]}
                        deadzone={deadzone}
                      />
                    </div>
                    <div className="rounded-lg bg-card/50 p-3 shadow-sm">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>X: {formatStickValue(axes[0])}</div>
                        <div>Y: {formatStickValue(axes[1])}</div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Current Drift:
                          </span>
                          <span
                            className={getDriftValueColor(
                              Math.max(Math.abs(axes[0]), Math.abs(axes[1])),
                              deadzone
                            )}
                          >
                            {getStableDriftValue(
                              Math.max(Math.abs(axes[0]), Math.abs(axes[1]))
                            )}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "mt-1 text-center text-xs font-medium rounded-full py-1",
                            getDriftStatusText(
                              Math.max(Math.abs(axes[0]), Math.abs(axes[1])),
                              deadzone
                            ).color,
                            "bg-black/5"
                          )}
                        >
                          {
                            getDriftStatusText(
                              Math.max(Math.abs(axes[0]), Math.abs(axes[1])),
                              deadzone
                            ).text
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Stick */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm font-medium text-violet-400">
                      {/* <Gauge className="h-4 w-4" />
                      <span>Right Stick</span> */}
                    </div>
                    <div className="flex justify-center">
                      <DeadzoneVisualizer
                        x={axes[2]}
                        y={axes[3]}
                        deadzone={deadzone}
                      />
                    </div>
                    <div className="rounded-lg bg-card/50 p-3 shadow-sm">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>X: {formatStickValue(axes[2])}</div>
                        <div>Y: {formatStickValue(axes[3])}</div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Current Drift:
                          </span>
                          <span
                            className={getDriftValueColor(
                              Math.max(Math.abs(axes[2]), Math.abs(axes[3])),
                              deadzone
                            )}
                          >
                            {getStableDriftValue(
                              Math.max(Math.abs(axes[2]), Math.abs(axes[3]))
                            )}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "mt-1 text-center text-xs font-medium rounded-full py-1",
                            getDriftStatusText(
                              Math.max(Math.abs(axes[2]), Math.abs(axes[3])),
                              deadzone
                            ).color,
                            "bg-black/5"
                          )}
                        >
                          {
                            getDriftStatusText(
                              Math.max(Math.abs(axes[2]), Math.abs(axes[3])),
                              deadzone
                            ).text
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deadzone Slider */}
                <div className="mt-6 border-t border-border/50 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-violet-400">
                      Deadzone Adjustment
                    </span>
                    <span
                      className={cn(
                        "text-3xl font-black transition-colors duration-200",
                        getDeadzoneDisplayColor(deadzone, axes)
                      )}
                    >
                      {deadzone?.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Slider
                      min={0}
                      max={0.4}
                      step={0.01}
                      value={[deadzone ?? 0.05]}
                      onValueChange={([value]) => {
                        onSettingsChange?.({ deadzone: value });
                      }}
                      className="py-2"
                    />
                    <div className="relative mt-1 h-6 m-[10px]">
                      {/* Tick marks */}
                      {Array.from({ length: 41 }).map((_, i) => {
                        const value = (i * 0.01).toFixed(2);
                        const isMajorTick = i % 5 === 0;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "absolute -translate-x-1/2",
                              isMajorTick
                                ? "h-3 w-0.5 bg-violet-500/50"
                                : "h-2 w-px bg-violet-500/30"
                            )}
                            style={{
                              left: `calc(${(Number(value) / 0.4) * 100}%)`,
                              top: 0,
                            }}
                          >
                            {isMajorTick && (
                              <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                                {value}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 grid gap-3 border-t border-border/50 pt-4 text-sm md:grid-cols-3">
                  <div className="rounded-lg bg-card/50 p-2 text-center shadow-sm">
                    <span className="text-muted-foreground">Deadzone:</span>{" "}
                    <span className="font-medium text-violet-400">
                      {deadzone.toFixed(2)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-card/50 p-2 text-center shadow-sm">
                    <span className="text-muted-foreground">
                      Active Buttons:
                    </span>{" "}
                    <span className="font-medium text-violet-400">
                      {buttons.filter(Boolean).length}
                    </span>
                  </div>
                  <div className="rounded-lg bg-card/50 p-2 text-center shadow-sm">
                    <span className="text-muted-foreground">Scale:</span>{" "}
                    <span className="font-medium text-violet-400">
                      {settings?.scale?.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controller container */}
          <div className="relative w-full h-full  items-center justify-center">
            <div className="relative w-full aspect-[800/592] max-h-full">
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

                  {/* Triggers Container */}
                  <div
                    className="absolute"
                    style={{
                      top: "-2%",
                      left: "0%",
                      width: "100%",
                      height: "20%",
                    }}
                  >
                    <div className="relative w-full h-full flex justify-between px-[9%] mx-auto">
                      <div className="w-[15%] h-full ml-[5.4%]">
                        <Triggers
                          pressed={
                            typeof finalGamepadState?.buttons?.[6] === "object"
                              ? finalGamepadState.buttons[6].value
                              : typeof finalGamepadState?.buttons?.[6] ===
                                  "number"
                                ? finalGamepadState.buttons[6]
                                : 0
                          }
                          side="left"
                          color={settings?.triggerColor || "#1a1a1a"}
                          pressedColor={
                            settings?.buttonPressedColor || "#ffffff"
                          }
                        />
                      </div>
                      <div className="w-[15%] h-full mr-[5.4%]">
                        <Triggers
                          pressed={
                            typeof finalGamepadState?.buttons?.[7] === "object"
                              ? finalGamepadState.buttons[7].value
                              : typeof finalGamepadState?.buttons?.[7] ===
                                  "number"
                                ? finalGamepadState.buttons[7]
                                : 0
                          }
                          side="right"
                          color={settings?.triggerColor || "#1a1a1a"}
                          pressedColor={
                            settings?.buttonPressedColor || "#ffffff"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bumpers */}
                  <div className="bumpers">
                    <div
                      className={cn(
                        "bumper left",
                        typeof finalGamepadState?.buttons[4] === "object"
                          ? finalGamepadState?.buttons[4].pressed
                          : !!finalGamepadState?.buttons[4] && "pressed"
                      )}
                    >
                      <Bumper
                        pressed={
                          typeof finalGamepadState?.buttons[4] === "object"
                            ? finalGamepadState?.buttons[4].pressed
                            : !!finalGamepadState?.buttons[4]
                        }
                      />
                    </div>
                    <div
                      className={cn(
                        "bumper right",
                        typeof finalGamepadState?.buttons[5] === "object"
                          ? finalGamepadState?.buttons[5].pressed
                          : !!finalGamepadState?.buttons[5] && "pressed"
                      )}
                    >
                      <Bumper
                        pressed={
                          typeof finalGamepadState?.buttons[5] === "object"
                            ? finalGamepadState?.buttons[5].pressed
                            : !!finalGamepadState?.buttons[5]
                        }
                      />
                    </div>
                  </div>

                  {/* Face Buttons */}
                  <div className="abxy">
                    {settings?.showButtonPresses && (
                      <>
                        <div>{renderButton(0, CrossButton)}</div>
                        <div>{renderButton(1, CircleButton)}</div>
                        <div>{renderButton(2, SquareButton)}</div>
                        <div>{renderButton(3, TriangleButton)}</div>
                      </>
                    )}
                  </div>

                  {/* D-Pad */}
                  <div
                    className="absolute"
                    style={{
                      width: "30%",
                      height: "30%",
                      top: "26%",
                      left: "4.25%",
                    }}
                  >
                    {settings?.showButtonPresses && (
                      <DPad
                        pressed={{
                          up:
                            typeof finalGamepadState?.buttons[12] === "object"
                              ? finalGamepadState?.buttons[12].pressed
                              : !!finalGamepadState?.buttons[12],
                          down:
                            typeof finalGamepadState?.buttons[13] === "object"
                              ? finalGamepadState?.buttons[13].pressed
                              : !!finalGamepadState?.buttons[13],
                          left:
                            typeof finalGamepadState?.buttons[14] === "object"
                              ? finalGamepadState?.buttons[14].pressed
                              : !!finalGamepadState?.buttons[14],
                          right:
                            typeof finalGamepadState?.buttons[15] === "object"
                              ? finalGamepadState?.buttons[15].pressed
                              : !!finalGamepadState?.buttons[15],
                        }}
                        color={
                          settings?.useCustomShapeColors
                            ? settings?.buttonShapeColor
                            : settings?.buttonColor || "#1a1a1a"
                        }
                        pressedColor={
                          settings?.useCustomShapeColors
                            ? settings?.buttonShapePressedColor
                            : settings?.buttonPressedColor || "#ffffff"
                        }
                      />
                    )}
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
                              (typeof finalGamepadState?.buttons[10] ===
                              "object"
                                ? finalGamepadState?.buttons[10].pressed
                                : !!finalGamepadState?.buttons[10]) && "pressed"
                            )}
                            style={
                              {
                                "--stick-color": (
                                  typeof finalGamepadState?.buttons[10] ===
                                  "object"
                                    ? finalGamepadState?.buttons[10].pressed
                                    : !!finalGamepadState?.buttons[10]
                                )
                                  ? safeFormatColor(
                                      settings?.buttonPressedColor
                                    )
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
                            transform: `translate(${axes[2] * 20}px, calc(-50% + ${axes[3] * 20}px))`,
                            width: "26.04%",
                            height: "89.52%",
                          }}
                        >
                          <DS4Sticks
                            className={cn(
                              "w-full h-full",
                              (typeof finalGamepadState?.buttons[11] ===
                              "object"
                                ? finalGamepadState?.buttons[11].pressed
                                : !!finalGamepadState?.buttons[11]) && "pressed"
                            )}
                            style={
                              {
                                "--stick-color": (
                                  typeof finalGamepadState?.buttons[11] ===
                                  "object"
                                    ? finalGamepadState?.buttons[11].pressed
                                    : !!finalGamepadState?.buttons[11]
                                )
                                  ? safeFormatColor(
                                      settings?.buttonPressedColor
                                    )
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
    </div>
  );
}
