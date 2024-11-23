import React, { createContext, useContext, useEffect, useRef } from "react";
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
  HookGamepadState,
  isGamepadButtonState,
} from "@/types/gamepad";

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

// Add a helper function to filter axes values based on deadzone
function filterAxes(axes: number[], deadzone: number): number[] {
  return axes.map((value) => (Math.abs(value) > deadzone ? value : 0));
}

export function GamepadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { gamepadState: hookGamepadState, isConnected } = useGamepad(0.05);
  const lastStateRef = useRef<GamepadState | null>(null);
  const DEFAULT_DEADZONE = 0.15;

  // Setup Supabase channel using realtime client directly
  useEffect(() => {
    if (!user?.id || !user?.username) return;

    console.log("[Channel] Attempting to connect with config:", {
      url: `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/realtime/v1/websocket`,
      apiKey:
        import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 8) + "...",
      channel: `gamepad:${user.username}`,
      userId: user.id,
    });

    const channel = realtime.channel(`gamepad:${user.username}`, {
      config: {
        broadcast: { self: false },
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on(
        "broadcast",
        { event: "gamepadState" },
        ({ payload }: { payload: { gamepadState: GamepadState } }) => {
          console.log("[Channel] Received gamepad state:", payload);
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          channelRef.current = channel;
          console.log("[Channel] Connected successfully!");
        }

        if (status === "CHANNEL_ERROR") {
          console.error("[Channel] Error subscribing:", {
            message: err?.message,
            error: err,
          });
        }

        if (status === "TIMED_OUT") {
          console.error("[Channel] Realtime server did not respond in time");
        }

        if (status === "CLOSED") {
          console.error("[Channel] Realtime channel was unexpectedly closed");
        }
      });

    return () => {
      console.log("[Channel] Cleaning up subscription");
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [user?.id, user?.username]);

  // Handle gamepad state updates
  useEffect(() => {
    if (!hookGamepadState || !user?.id || !channelRef.current) return;

    // Get the filtered axes based on deadzone
    const filteredAxes = filterAxes(hookGamepadState.axes, DEFAULT_DEADZONE);

    // Create transformed state with filtered axes
    const transformedState: GamepadState = {
      buttons: hookGamepadState.buttons.map((button) =>
        isGamepadButtonState(button) ? button.pressed : button
      ),
      axes: filteredAxes,
    };

    // Check for any changes in button states or significant axis movement
    const hasButtonStateChange = lastStateRef.current
      ? transformedState.buttons.some(
          (pressed, index) => pressed !== lastStateRef.current?.buttons[index]
        )
      : transformedState.buttons.some((pressed) => pressed);

    const hasSignificantMovement = filteredAxes.some((value) => value !== 0);

    // Send update if there are any changes in buttons or significant movement
    if (hasButtonStateChange || hasSignificantMovement) {
      // Always send state to ensure button releases are captured
      channelRef.current
        .send({
          type: "broadcast",
          event: "gamepadState",
          payload: { gamepadState: transformedState },
        })
        .catch((error: any) => {
          if (!error?.message?.includes("429")) {
            console.error("Error broadcasting gamepad state:", error);
          }
        });

      lastStateRef.current = transformedState;
    } else if (lastStateRef.current) {
      // If no current input but we had previous input, send a zero state
      const hasAnyPreviousInput =
        lastStateRef.current.buttons.some((pressed) => pressed) ||
        lastStateRef.current.axes.some((value) => value !== 0);

      if (hasAnyPreviousInput) {
        const zeroState: GamepadState = {
          buttons: new Array(transformedState.buttons.length).fill(false),
          axes: new Array(transformedState.axes.length).fill(0),
        };

        channelRef.current
          .send({
            type: "broadcast",
            event: "gamepadState",
            payload: { gamepadState: zeroState },
          })
          .catch((error: any) => {
            if (!error?.message?.includes("429")) {
              console.error("Error broadcasting gamepad state:", error);
            }
          });

        lastStateRef.current = zeroState;
      }
    }
  }, [hookGamepadState, user?.id]);

  const value = {
    gamepadState: hookGamepadState
      ? {
          buttons: hookGamepadState.buttons.map((button) =>
            isGamepadButtonState(button) ? button.pressed : button
          ),
          axes: filterAxes(hookGamepadState.axes, DEFAULT_DEADZONE),
        }
      : null,
    isConnected,
  };

  return (
    <GamepadContext.Provider value={value}>{children}</GamepadContext.Provider>
  );
}

export const useGamepadContext = () => useContext(GamepadContext);
