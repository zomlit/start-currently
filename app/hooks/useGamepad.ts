import { useRef, useCallback, useEffect, useState } from "react";
import { useGamepadStore } from "@/store/gamepadStore";
import type { HookGamepadState } from "@/types/gamepad";

export function useGamepad(deadzone: number = 0.1) {
  const { setGamepadState, setIsConnected } = useGamepadStore();
  const frameRef = useRef<number | undefined>(undefined);
  const lastState = useRef<string>("");
  const gamepadIndex = useRef<number>(-1);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const pollGamepad = useCallback(() => {
    try {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[gamepadIndex.current];

      if (gamepad && gamepad.connected) {
        const newState: HookGamepadState = {
          buttons: gamepad.buttons.map((button) => ({
            pressed: button.pressed,
            value: Math.abs(button.value) < deadzone ? 0 : button.value,
          })),
          axes: gamepad.axes.map((axis) =>
            Math.abs(axis) < deadzone ? 0 : axis
          ),
          timestamp: performance.now(),
        };

        const comparisonState = {
          buttons: newState.buttons,
          axes: newState.axes,
        };
        const newStateString = JSON.stringify(comparisonState);

        if (newStateString !== lastState.current) {
          lastState.current = newStateString;
          setGamepadState(newState);
        }
      }
    } catch (error) {
      console.error("Gamepad polling error:", error);
    }
  }, [deadzone, setGamepadState]);

  const startPolling = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const poll = () => {
      pollGamepad();
      frameRef.current = requestAnimationFrame(poll);
    };
    frameRef.current = requestAnimationFrame(poll);

    // Backup interval for when tab is not focused
    intervalRef.current = setInterval(pollGamepad, 1000 / 60);
  }, [pollGamepad]);

  const handleGamepadConnected = useCallback(
    (event: GamepadEvent) => {
      gamepadIndex.current = event.gamepad.index;
      setIsConnected(true);
      startPolling();

      // Dispatch custom event for connection status
      window.dispatchEvent(
        new CustomEvent("gamepadConnectionChange", {
          detail: {
            connected: true,
            gamepad: event.gamepad,
          },
        })
      );
    },
    [startPolling, setIsConnected]
  );

  const handleGamepadDisconnected = useCallback(
    (event: GamepadEvent) => {
      if (event.gamepad.index === gamepadIndex.current) {
        gamepadIndex.current = -1;
        lastState.current = "";
        setIsConnected(false);
        setGamepadState(null);

        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Dispatch custom event for connection status
        window.dispatchEvent(
          new CustomEvent("gamepadConnectionChange", {
            detail: {
              connected: false,
              gamepad: event.gamepad,
            },
          })
        );
      }
    },
    [setIsConnected, setGamepadState]
  );

  useEffect(() => {
    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    // Check for already connected gamepads
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gamepadIndex.current = i;
        handleGamepadConnected({ gamepad: gamepads[i] } as GamepadEvent);
        break;
      }
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
    };
  }, [handleGamepadConnected, handleGamepadDisconnected]);

  return {
    gamepadState: useGamepadStore((state) => state.gamepadState),
    isConnected: useGamepadStore((state) => state.isConnected),
  };
}
