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
            (payload) => {
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

  // Subscribe to gamepad state updates
  useEffect(() => {
    if (!username) return;

    const gamepadChannel = supabase.channel(`gamepad:${username}`, {
      config: { broadcast: { self: false } },
    });

    gamepadChannel
      .on("broadcast", { event: "gamepadState" }, ({ payload }) => {
        if (!payload?.gamepadState) return;

        const state = payload.gamepadState;

        // Transform the state to match expected format
        const transformedState = {
          buttons: state.buttons.map((button: any, index: number) => {
            // For triggers (buttons 6 and 7), preserve the analog value
            if (index === 6 || index === 7) {
              const value = typeof button === "object" ? button.value : button;
              return {
                pressed: typeof button === "object" ? button.pressed : !!button,
                value: typeof value === "number" ? value : button ? 1 : 0,
              };
            }

            // For all other buttons, just use pressed state
            return {
              pressed: typeof button === "object" ? button.pressed : !!button,
              value: 0, // Digital buttons don't have analog values
            };
          }),
          axes: state.axes,
        };

        const hasActivity =
          transformedState.buttons.some((button) => button.pressed) ||
          transformedState.axes.some(
            (axis: number) => Math.abs(axis) > (settings.deadzone ?? 0.05)
          );

        if (hasActivity) {
          setLastActivityTime(Date.now());
          setIsInactive(false);
          updateConnectionState(true);
        }

        setRemoteGamepadState(transformedState);
        setGamepadState(transformedState);
      })
      .subscribe();

    return () => {
      gamepadChannel.unsubscribe();
    };
  }, [username, settings.deadzone, updateConnectionState, setGamepadState]);

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

  // Update the render logic to use AnimatePresence
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
