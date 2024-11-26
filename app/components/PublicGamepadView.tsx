import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "@tanstack/react-router";
import { GamepadViewer } from "@/components/GamepadViewer";
import { supabase } from "@/utils/supabase/client";
import { defaultGamepadSettings } from "@/lib/gamepad-settings";
import type {
  GamepadSettings,
  GamepadState,
  GamepadButtonState,
} from "@/types/gamepad";
import { useGamepadStore } from "@/store/gamepadStore";
import { Gamepad } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useGamepadProvider } from "@/providers/GamepadProvider";

// Add this helper function at the top
const areSettingsEqual = (
  oldSettings: GamepadSettings,
  newSettings: GamepadSettings
) => {
  return JSON.stringify(oldSettings) === JSON.stringify(newSettings);
};

// Add this helper at the top
const findSettingsDiff = (
  oldSettings: GamepadSettings,
  newSettings: GamepadSettings
) => {
  const changes: Record<string, { old: any; new: any }> = {};

  // Create normalized versions of the settings
  const normalizedOld = {
    ...defaultGamepadSettings, // Start with defaults
    ...oldSettings, // Override with old settings
  };

  const normalizedNew = {
    ...defaultGamepadSettings, // Start with defaults
    ...newSettings, // Override with new settings
  };

  // Compare normalized settings
  Object.keys(normalizedNew).forEach((key) => {
    const oldValue = normalizedOld[key as keyof GamepadSettings];
    const newValue = normalizedNew[key as keyof GamepadSettings];

    // Only add to changes if values are actually different
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = {
        old: oldValue,
        new: newValue,
      };
    }
  });

  return changes;
};

// Create a collapsible log entry component
const LogEntry = React.memo(({ log }: { log: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this is a raw state log
  if (typeof log !== "string" || !log) {
    return null;
  }

  if (log.includes("Raw state received:")) {
    try {
      // Extract timestamp and icons (everything before the actual JSON)
      const jsonStartIndex = log.indexOf('{"axes"');
      if (jsonStartIndex === -1) return null;

      const prefix = log.substring(0, jsonStartIndex).trim();
      const jsonStr = log.substring(jsonStartIndex);
      const jsonData = JSON.parse(jsonStr);

      // Create a condensed summary
      const summary = {
        axes: jsonData.axes.some((v: number) => v !== 0)
          ? jsonData.axes.map((v: number) => v.toFixed(2)).join(", ")
          : "0",
        buttons: jsonData.buttons.filter((b: any) => b.pressed).length,
      };

      return (
        <div className="border-l-2 border-blue-500/50 pl-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full text-left hover:bg-white/5 rounded px-1"
          >
            <span
              className="transform transition-transform duration-200"
              style={{
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ▶
            </span>
            <span className="flex-1">
              {prefix}{" "}
              <span className="text-gray-400">
                {`[Axes: ${summary.axes}] [Active Buttons: ${summary.buttons}]`}
              </span>
            </span>
          </button>
          {isExpanded && (
            <pre className="mt-1 pl-6 text-xs overflow-x-auto bg-black/20 p-2 rounded">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          )}
        </div>
      );
    } catch (e) {
      // Fallback to regular log if JSON parsing fails
      return (
        <div className="border-l-2 border-blue-500/50 pl-2 whitespace-pre-wrap">
          {log}
        </div>
      );
    }
  }

  // Regular log entry
  return (
    <div className="border-l-2 border-blue-500/50 pl-2 whitespace-pre-wrap">
      {log}
    </div>
  );
});

// Add type for the payload
type GamepadWidgetPayload = {
  new: {
    settings?: Record<string, any>;
    gamepad_settings?: Record<string, any>;
    showPressedButtons?: boolean;
    style?: string;
    layout?: string;
  };
};

export function PublicGamepadView() {
  const { username } = useParams({ from: "/$username/gamepad" });
  const [settings, setSettings] = useState<GamepadSettings>(
    defaultGamepadSettings
  );
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInactive, setIsInactive] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [remoteGamepadState, setRemoteGamepadState] =
    useState<GamepadState | null>(null);
  const inactivityTimeout = (settings.inactivityTimeout || 10) * 1000;
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const maxLogs = 50; // Keep last 50 logs
  const [lastButtonState, setLastButtonState] = useState<{
    [key: number]: number;
  }>({});
  const BUTTON_DEBOUNCE_TIME = 100; // ms between same button events
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastStateRef = useRef<GamepadState | null>(null);

  // Remove local gamepad context usage
  const { setGamepadState } = useGamepadStore();
  const lastConnectionStateRef = useRef<boolean>(false);

  // Update the connection state handler
  const updateConnectionState = useCallback((connected: boolean) => {
    if (lastConnectionStateRef.current !== connected) {
      if (connected) {
        console.log("Controller activity detected");
        toast.success("Controller connected", {
          description: "Now receiving controller input",
        });
      } else {
        console.log("Controller activity stopped");
        toast.error("Controller disconnected", {
          description: "Waiting for controller to reconnect...",
        });
      }
      lastConnectionStateRef.current = connected;
    }
  }, []);

  // Subscribe to settings changes
  useEffect(() => {
    if (!username) return;

    // First get the user_id
    const getUserId = async () => {
      const { data: profileData } = await supabase
        .from("UserProfile")
        .select("user_id")
        .eq("username", username)
        .single();

      if (profileData?.user_id) {
        // Subscribe to settings changes in realtime
        const settingsSubscription = supabase
          .channel("settings_changes")
          .on(
            "postgres_changes",
            {
              event: "*", // Listen to all changes
              schema: "public",
              table: "GamepadWidget",
              filter: `user_id=eq.${profileData.user_id}`,
            },
            (payload: { new: GamepadWidgetPayload["new"] }) => {
              console.log("Settings update received:", payload);

              if (payload.new) {
                // Update settings with the new values
                const newSettings = {
                  ...defaultGamepadSettings,
                  ...(payload.new.settings || {}),
                  ...(payload.new.gamepad_settings || {}),
                  showButtonPresses: payload.new.showPressedButtons ?? true,
                  style: payload.new.style,
                  layout: payload.new.layout,
                };

                console.log("Applying new settings:", newSettings);
                setSettings(newSettings as GamepadSettings);
              }
            }
          )
          .subscribe();

        return () => {
          settingsSubscription.unsubscribe();
        };
      }
    };

    getUserId();
  }, [username]);

  // Enhanced log helper with source and type information
  const addLog = useCallback(
    (
      message: string,
      source: "worker" | "supabase" | "system",
      type: "button" | "axis" | "info" | "error"
    ) => {
      setDebugLogs((prev) => {
        if (!Array.isArray(prev)) return [message];
        const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
        const sourceColor = {
          worker: "🟦",
          supabase: "🟩",
          system: "⬜",
        }[source];
        const typeIcon = {
          button: "🔘",
          axis: "↔️",
          info: "ℹ️",
          error: "❌",
        }[type];
        const newLog = `${timestamp} ${sourceColor} ${typeIcon} ${message}`;
        return [...prev, newLog].slice(-maxLogs);
      });
    },
    []
  );

  // Debounced button handler
  const handleButtonPress = useCallback(
    debounce((buttonIndex: number, timestamp: number) => {
      const lastPress = lastButtonState[buttonIndex] || 0;
      if (timestamp - lastPress > BUTTON_DEBOUNCE_TIME) {
        setLastButtonState((prev) => ({ ...prev, [buttonIndex]: timestamp }));
        return true;
      }
      return false;
    }, 50),
    [lastButtonState]
  );

  // Add frame tracking with higher FPS
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const TARGET_FPS = 120; // Increased from 60 to 120
  const FRAME_TIME = 1000 / TARGET_FPS;
  const DEBOUNCE_TIME = 16; // Reduced for more responsive feel

  // Subscribe to gamepad state updates
  useEffect(() => {
    if (!username) return;

    try {
      // Initialize Supabase channel
      const channel = supabase
        .channel(`gamepad:${username}`)
        .on("broadcast", { event: "gamepadState" }, ({ payload }) => {
          if (!payload?.gamepadState) return;

          // Use performance.now() for more accurate timing
          const now = performance.now();
          const timeSinceLastFrame = now - lastFrameTimeRef.current;

          // Cancel any pending frame
          if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
          }

          // Schedule new frame if enough time has passed
          if (timeSinceLastFrame >= FRAME_TIME) {
            frameRef.current = requestAnimationFrame(() => {
              const state = payload.gamepadState;
              setRemoteGamepadState(state);
              lastStateRef.current = state;

              // Log state changes
              const activeButtons = state.buttons.filter(
                (b: { pressed: boolean }) => b.pressed
              ).length;
              const activeAxes = state.axes.filter(
                (a: number) => Math.abs(a) > settings.deadzone
              ).length;

              if (activeButtons > 0 || activeAxes > 0) {
                addLog(
                  `Raw state received: [Axes: ${activeAxes}] [Active Buttons: ${activeButtons}]`,
                  "supabase",
                  "info"
                );
              }

              // Track activity
              const hasActivity =
                state.buttons.some((b: { pressed: boolean }) => b.pressed) ||
                state.axes.some(
                  (axis: number) => Math.abs(axis) > settings.deadzone
                );

              if (hasActivity) {
                setLastActivityTime(now);
                setIsInactive(false);
                updateConnectionState(true);

                // Log button presses
                state.buttons.forEach(
                  (button: { pressed: boolean }, index: number) => {
                    if (button.pressed) {
                      addLog(`Buttons pressed: ${index}`, "supabase", "button");
                    }
                  }
                );
              }

              lastFrameTimeRef.current = now;
            });
          }
        })
        .subscribe((status) => {
          addLog(
            `Channel subscription status for gamepad:${username}: ${status}`,
            "system",
            "info"
          );
        });

      // Log connection status
      addLog(
        `Initialized gamepad monitoring for ${username}`,
        "system",
        "info"
      );

      return () => {
        // Cleanup animation frame on unmount
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        channel.unsubscribe();
      };
    } catch (error) {
      console.error("Failed to initialize gamepad monitoring:", error);
      addLog(`Failed to initialize: ${error}`, "system", "error");
    }
  }, [username, settings.deadzone, updateConnectionState, addLog]);

  // Check for inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      if (timeSinceLastActivity > inactivityTimeout) {
        setIsInactive(true);
        updateConnectionState(false);
      }
    };

    const intervalId = setInterval(checkInactivity, 1000);
    return () => clearInterval(intervalId);
  }, [lastActivityTime, inactivityTimeout, updateConnectionState]);

  // Only hide if both conditions are met
  const shouldHideController = settings.hideWhenInactive && isInactive;

  // Load initial settings and get userId
  useEffect(() => {
    async function loadSettings() {
      if (!username) return;

      try {
        // First get the user_id
        const { data: profileData } = await supabase
          .from("UserProfile")
          .select("user_id")
          .eq("username", username)
          .single();

        if (!profileData?.user_id) {
          throw new Error("User not found");
        }

        // Then get the settings
        const { data: widgetData } = await supabase
          .from("GamepadWidget")
          .select(
            "settings, gamepad_settings, layout, showPressedButtons, style"
          )
          .eq("user_id", profileData.user_id)
          .single();

        if (widgetData) {
          const newSettings = {
            ...defaultGamepadSettings,
            ...(widgetData.settings || {}),
            ...(widgetData.gamepad_settings || {}),
            showButtonPresses: widgetData.showPressedButtons ?? true,
            style: widgetData.style,
            layout: widgetData.layout,
          };

          setSettings(newSettings as GamepadSettings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    loadSettings();
  }, [username]);

  // Update the DebugOverlayContent component
  const DebugOverlayContent = React.memo(({ logs }: { logs: string[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [logs]);

    return (
      <div className="fixed bottom-4 left-2 right-2 w-full bg-black/80 text-white rounded-lg shadow-lg overflow-hidden p-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Debug Log</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setDebugLogs([])}
              className="text-xs bg-red-500/20 hover:bg-red-500/40 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="text-xs font-mono h-96 overflow-y-auto space-y-1 scroll-smooth"
        >
          {logs.map((log, i) => (
            <LogEntry key={i} log={log} />
          ))}
        </div>
      </div>
    );
  });

  // Update the render logic
  return (
    <>
      <AnimatePresence mode="wait">
        {shouldHideController ? (
          <motion.div
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "flex",
              height: "100%",
              width: "100%",
              flexDirection: "column",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <Gamepad className="h-12 w-12 text-muted-foreground/50" />
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GamepadViewer
              settings={settings}
              username={username}
              gamepadState={remoteGamepadState}
              isPublicView={true}
              disableDirectInput={true}
              onSettingsChange={undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* {process.env.NODE_ENV === "development" && (
        <DebugOverlayContent logs={debugLogs} />
      )} */}
    </>
  );
}
