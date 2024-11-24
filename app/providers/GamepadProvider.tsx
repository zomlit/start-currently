import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
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
}

const GamepadContext = createContext<GamepadContextType>({
  gamepadState: null,
  isConnected: false,
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

export function GamepadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastStateRef = useRef<GamepadState | null>(null);

  // Add polling in main thread to ensure continuous updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    let frameId: number;
    let lastTime = 0;
    const FRAME_TIME = 1000 / 60; // 60fps

    const pollGamepad = (timestamp: number) => {
      if (timestamp - lastTime >= FRAME_TIME) {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[0];

        if (gamepad) {
          // Transform the state to match expected format
          const state: GamepadState = {
            buttons: gamepad.buttons.map((button, index) => {
              // For triggers (buttons 6 and 7), preserve the analog value
              if (index === 6 || index === 7) {
                return {
                  pressed: button.pressed,
                  value: button.value, // Keep the raw analog value
                };
              }
              // For all other buttons, just use pressed state
              return {
                pressed: button.pressed,
                value: button.pressed ? 1 : 0,
              };
            }),
            axes: gamepad.axes.map((axis) =>
              Math.abs(axis) < DEFAULT_DEADZONE ? 0 : axis
            ),
            timestamp: Date.now(),
          };

          // Only broadcast if there's a significant change
          if (
            hasSignificantChange(state, lastStateRef.current, DEFAULT_DEADZONE)
          ) {
            if (
              window.location.pathname === "/widgets/gamepad" &&
              channelRef.current &&
              user?.username
            ) {
              console.log("Broadcasting state with trigger values:", {
                left: state.buttons[6].value,
                right: state.buttons[7].value,
              });

              channelRef.current
                .send({
                  type: "broadcast",
                  event: "gamepadState",
                  payload: { gamepadState: state },
                })
                .catch((error: any) => {
                  if (!error?.message?.includes("429")) {
                    console.error(
                      "[GamepadProvider] Error broadcasting state:",
                      error
                    );
                  }
                });
            }

            setGamepadState(state);
            setIsConnected(true);
            lastStateRef.current = state;
          }
        }

        lastTime = timestamp;
      }
      frameId = requestAnimationFrame(pollGamepad);
    };

    frameId = requestAnimationFrame(pollGamepad);

    // Keep polling even when tab is not focused
    const visibilityHandler = () => {
      if (document.hidden) {
        frameId = requestAnimationFrame(pollGamepad);
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, [user?.username]);

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

  const value = {
    gamepadState,
    isConnected,
  };

  return (
    <GamepadContext.Provider value={value}>{children}</GamepadContext.Provider>
  );
}

export const useGamepadContext = () => useContext(GamepadContext);
