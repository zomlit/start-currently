import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useUser } from "@clerk/tanstack-start";
import { supabase } from "@/utils/supabase/client";
import { useGamepad } from "@/hooks/useGamepad";
import type {
  RealtimeChannel,
  RealtimeChannelSendResponse,
} from "@supabase/supabase-js";
import { RealtimeClient } from "@supabase/supabase-js";
import {
  GamepadState,
  hasSignificantChange,
  DEFAULT_DEADZONE,
} from "@/utils/gamepad";
import { useVisibilityChange } from "@/hooks/useVisibilityChange";

interface GamepadContextType {
  gamepadState: GamepadState | null;
  isConnected: boolean;
  setEnabled: (enabled: boolean) => void;
}

const GamepadContext = createContext<GamepadContextType>({
  gamepadState: null,
  isConnected: false,
  setEnabled: () => {},
});

// Create a new RealtimeClient with worker and heartbeat config
const realtime = new RealtimeClient(
  `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/realtime/v1/websocket`,
  {
    params: {
      apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
      vsn: "1.0.0",
    },
    worker: true,
    heartbeatIntervalMs: 15000,
    timeout: 30000,
  }
);

// Add worker type
declare const Worker: {
  new (
    stringUrl: string,
    options?: { type?: "classic" | "module" | "shared" }
  ): Worker;
};

// Add zero timeout implementation
const setupZeroTimeout = () => {
  const timeouts: Function[] = [];
  const messageName = "zero-timeout-message";

  window.addEventListener(
    "message",
    (event) => {
      if (event.source === window && event.data === messageName) {
        event.stopPropagation();
        if (timeouts.length > 0) {
          const fn = timeouts.shift();
          fn?.();
        }
      }
    },
    true
  );

  return (fn: Function) => {
    timeouts.push(fn);
    window.postMessage(messageName, "*");
  };
};

export function GamepadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const workerRef = useRef<SharedWorker | null>(null);
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastStateRef = useRef<GamepadState | null>(null);
  const lastPollTime = useRef<number>(0);
  const POLL_INTERVAL = 1000 / 60; // 60fps
  const [isEnabled, setEnabled] = useState(true);

  // Add a broadcast helper
  const broadcastState = useCallback(
    (state: GamepadState) => {
      if (channelRef.current && user?.username) {
        console.log("[GamepadProvider] Broadcasting state:", {
          buttons: state.buttons.map((b) => b.pressed),
          axes: state.axes.map((a) =>
            Math.abs(a) > DEFAULT_DEADZONE ? a.toFixed(2) : "0"
          ),
          timestamp: state.timestamp,
        });

        channelRef.current
          .send({
            type: "broadcast",
            event: "gamepadState",
            payload: { gamepadState: state },
          })
          .catch((error: any) => {
            if (!error?.message?.includes("429")) {
              console.error("[GamepadProvider] Broadcast error:", error);
            }
          });
      }
    },
    [user?.username]
  );

  // Add state comparison helper
  const hasStateChanged = useCallback(
    (oldState: GamepadState | null, newState: GamepadState) => {
      if (!oldState) return true;

      // Check for significant changes
      const hasButtonChanges = newState.buttons.some(
        (button, index) => button.pressed !== oldState.buttons[index]?.pressed
      );

      const hasAxisChanges = newState.axes.some((axis, index) => {
        const oldAxis = oldState.axes[index] || 0;
        return Math.abs(axis - oldAxis) > DEFAULT_DEADZONE;
      });

      return hasButtonChanges || hasAxisChanges;
    },
    []
  );

  // Update the polling logic
  useEffect(() => {
    if (typeof window === "undefined" || !isEnabled) return;

    // Create polling worker
    const pollWorker = new Worker(
      new URL("../workers/gamepad-poll.worker.ts", import.meta.url).href,
      { type: "module" }
    );

    // Use setInterval for more reliable polling
    const pollInterval = setInterval(() => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        const state = {
          buttons: gamepad.buttons.map((button, index) => ({
            pressed: button.pressed,
            value:
              index === 6 || index === 7
                ? button.value
                : button.pressed
                  ? 1
                  : 0,
          })),
          axes: gamepad.axes.map((axis) =>
            Math.abs(axis) < DEFAULT_DEADZONE ? 0 : axis
          ),
          timestamp: Date.now(),
        };

        // Send state to poll worker
        pollWorker.postMessage({
          type: "GAMEPAD_EVENT",
          state,
        });
      }
    }, 16); // ~60fps

    // Start the worker polling
    pollWorker.postMessage({ type: "START_POLLING" });

    // Handle messages from poll worker
    pollWorker.onmessage = (event) => {
      const { type, state } = event.data;
      if (type === "GAMEPAD_STATE" && state) {
        // Send to shared worker
        workerRef.current?.port.postMessage({
          type: "UPDATE_STATE",
          state,
          timestamp: Date.now(),
        });

        // Update local state
        setGamepadState(state);
        lastStateRef.current = state;
        broadcastState(state);
      }
    };

    return () => {
      clearInterval(pollInterval);
      pollWorker.postMessage({ type: "STOP_POLLING" });
      pollWorker.terminate();
    };
  }, [isEnabled, broadcastState]);

  // Update the shared worker message handler
  useEffect(() => {
    if (!user?.id || !isEnabled) return;

    try {
      // Initialize SharedWorker
      const worker = new SharedWorker(
        new URL("../workers/gamepad.shared.worker.ts", import.meta.url),
        { type: "module" }
      );

      worker.port.start();
      workerRef.current = worker;

      // Initialize worker with user info
      worker.port.postMessage({
        type: "INIT",
        userId: user.id,
        username: user.username,
        isPublic: false,
      });

      // Handle messages from worker
      worker.port.onmessage = (event) => {
        const { type, state } = event.data;

        switch (type) {
          case "BROADCAST_STATE":
            if (state) {
              console.log(
                "[GamepadProvider] Broadcasting state from worker:",
                state
              );
              setGamepadState(state);
              broadcastState(state);
            }
            break;

          case "DEBUG_LOG":
            console.log("[Worker]", event.data.message);
            break;
        }
      };

      // Error handling
      worker.onerror = (error) => {
        console.error("[Worker Error]", error);
      };

      return () => {
        if (workerRef.current) {
          workerRef.current.port.postMessage({ type: "CLEANUP" });
          workerRef.current = null;
        }
      };
    } catch (error) {
      console.error("Failed to initialize SharedWorker:", error);
    }
  }, [user?.id, user?.username, isEnabled, broadcastState]);

  // Setup Supabase channel
  useEffect(() => {
    if (!user?.id || !user?.username) return;

    const channel = realtime.channel(`gamepad:${user.username}`, {
      config: {
        broadcast: { self: false },
        presence: {
          key: user.id,
        },
      },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channelRef.current = channel;
        console.log("[Channel] Connected successfully!");
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id, user?.username]);

  // Only log state changes when they happen
  useEffect(() => {
    if (gamepadState) {
      const hasActivity =
        gamepadState.buttons.some((b) => b.pressed) ||
        gamepadState.axes.some((a) => Math.abs(a) > DEFAULT_DEADZONE);
      if (hasActivity) {
        console.log("[GamepadProvider] State update:", {
          buttons: gamepadState.buttons.map((b) => b.pressed),
          axes: gamepadState.axes.map((a) => a.toFixed(2)),
        });
      }
    }
  }, [gamepadState]);

  const value = useMemo(
    () => ({
      gamepadState,
      isConnected: !!gamepadState,
      setEnabled,
    }),
    [gamepadState]
  );

  console.log("[GamepadProvider] Current state:", {
    gamepadState,
    isConnected,
  });

  return (
    <GamepadContext.Provider value={value}>{children}</GamepadContext.Provider>
  );
}

export const useGamepadContext = () => useContext(GamepadContext);

export function useGamepadProvider() {
  const context = useContext(GamepadContext);
  if (!context) {
    throw new Error("useGamepadProvider must be used within GamepadProvider");
  }
  return context;
}
