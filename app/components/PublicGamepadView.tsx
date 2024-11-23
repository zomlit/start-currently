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
import type { GamepadSettings, GamepadState } from "@/types/gamepad";
import { useGamepadStore } from "@/store/gamepadStore";
import { Gamepad } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isConnected, setIsConnected] = useState(false);
  const gamepadState = useGamepadStore((state) => state.gamepadState);
  const { setGamepadState, setIsConnected: setStoreIsConnected } =
    useGamepadStore();
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [isInactive, setIsInactive] = useState(false);
  const inactivityTimeout = (settings.inactivityTimeout || 10) * 1000;

  // Add a ref to track the last state to prevent unnecessary updates
  const lastStateRef = useRef<GamepadState | null>(null);

  // Combine the connection state updates
  const updateConnectionState = useCallback(
    (isConnected: boolean) => {
      setIsConnected(isConnected);
      setStoreIsConnected(isConnected);
    },
    [setStoreIsConnected]
  );

  // Update the gamepad state handler
  const handleGamepadState = useCallback(
    (state: GamepadState) => {
      if (!state.buttons || !state.axes) {
        console.log("Invalid gamepad state received:", state);
        return;
      }

      // Set connected states when we receive any state
      updateConnectionState(true);

      // Check for actual activity
      const hasActivity =
        state.buttons.some((button) => button) ||
        state.axes.some((axis) => Math.abs(axis) > (settings.deadzone ?? 0.05));

      console.log("Activity check:", {
        hasActivity,
        buttons: state.buttons,
        axes: state.axes,
        timestamp: Date.now(),
      });

      if (hasActivity) {
        console.log("Activity detected, resetting timer");
        setLastActivityTime(Date.now());
        setIsInactive(false);
      }

      // Always update the gamepad state
      setGamepadState(state);
    },
    [setGamepadState, updateConnectionState, settings.deadzone]
  );

  // Subscribe to both gamepad state and settings changes
  useEffect(() => {
    if (!username || !userId) return;

    let mounted = true;

    // Create channels for both gamepad state and settings
    const gamepadChannel = supabase.channel(`gamepad:${username}`, {
      config: { broadcast: { self: false } },
    });

    // Subscribe to settings changes in realtime
    const settingsSubscription = supabase
      .channel("settings_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "GamepadWidget",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (!mounted) return;
          console.log("Settings update received:", payload);

          const newSettings = {
            ...defaultGamepadSettings,
            ...(payload.new.settings || {}),
            ...(payload.new.gamepad_settings || {}),
            showButtonPresses: payload.new.showPressedButtons ?? true,
            style: payload.new.style,
            layout: payload.new.layout,
          };

          // Only update if there are actual changes
          if (!areSettingsEqual(settings, newSettings)) {
            console.log("Applying new settings:", newSettings);
            setSettings(newSettings as GamepadSettings);
          }
        }
      )
      .subscribe();

    // Subscribe to gamepad state updates
    gamepadChannel
      .on("broadcast", { event: "gamepadState" }, ({ payload }) => {
        if (!mounted || !payload?.gamepadState) return;

        const state = payload.gamepadState;
        const hasActivity =
          state.buttons.some((button) => button) ||
          state.axes.some(
            (axis) => Math.abs(axis) > (settings.deadzone ?? 0.05)
          );

        if (hasActivity) {
          setLastActivityTime(Date.now());
          setIsInactive(false);
        }

        setGamepadState(state);
      })
      .subscribe();

    return () => {
      mounted = false;
      gamepadChannel.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  }, [username, userId]); // Only depend on username and userId

  // Separate effect to handle inactivity check
  useEffect(() => {
    if (!settings.hideWhenInactive) {
      setIsInactive(false);
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      console.log({
        now,
        lastActivityTime,
        timeSinceLastActivity,
        inactivityTimeout,
        hideWhenInactive: settings.hideWhenInactive,
        shouldHide: timeSinceLastActivity > inactivityTimeout,
      });

      // Update isInactive state based on timeout
      setIsInactive(timeSinceLastActivity > inactivityTimeout);
    };

    // Check every second
    const interval = setInterval(checkInactivity, 1000);
    return () => clearInterval(interval);
  }, [lastActivityTime, inactivityTimeout, settings.hideWhenInactive]);

  // Only hide if both conditions are met
  const shouldHideController = settings.hideWhenInactive && isInactive;

  // Load initial settings and get userId
  useEffect(() => {
    async function loadSettings() {
      if (!username) return;

      try {
        const { data: profileData } = await supabase
          .from("UserProfile")
          .select("user_id")
          .eq("username", username)
          .single();

        if (!profileData?.user_id) {
          throw new Error("User not found");
        }

        console.log("Found user:", profileData.user_id); // Debug log
        setUserId(profileData.user_id);

        const { data: widgetData } = await supabase
          .from("GamepadWidget")
          .select(
            "settings, gamepad_settings, layout, showPressedButtons, style"
          )
          .eq("user_id", profileData.user_id)
          .single();

        if (widgetData) {
          console.log("Found widget settings:", widgetData); // Debug log
          const combinedSettings = {
            ...defaultGamepadSettings,
            ...(widgetData.settings || {}),
            ...(widgetData.gamepad_settings || {}),
            showButtonPresses: widgetData.showPressedButtons ?? true,
            style: widgetData.style,
            layout: widgetData.layout,
          };
          setSettings(combinedSettings as GamepadSettings);
        }
      } catch (error) {
        console.error("Error loading gamepad settings:", error);
        setError("Failed to load gamepad settings");
      }
    }

    loadSettings();
  }, [username]);

  // Update the render logic to use AnimatePresence
  return (
    <AnimatePresence mode="wait">
      {shouldHideController ? (
        <motion.div
          key="inactive"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-full w-full flex-col justify-center space-y-4"
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
            gamepadState={gamepadState}
            isPublicView={true}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
