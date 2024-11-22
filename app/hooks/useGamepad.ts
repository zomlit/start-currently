import { useRef, useCallback, useEffect } from "react";
import { useGamepadStore } from "@/store/gamepadStore";

interface GamepadState {
  buttons: {
    pressed: boolean;
    value: number;
  }[];
  axes: number[];
  triggers: {
    left: number;
    right: number;
  };
  timestamp: number;
}

export function useGamepad(deadzone: number = 0.1) {
  const { setGamepadState, setIsConnected } = useGamepadStore();
  const frameRef = useRef<number>();
  const lastState = useRef<string>("");
  const gamepadIndex = useRef<number>(-1);
  const intervalRef = useRef<NodeJS.Timeout>();

  const pollGamepad = useCallback(() => {
    try {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[gamepadIndex.current];

      if (gamepad && gamepad.connected) {
        const newState = {
          buttons: gamepad.buttons.map((button) => ({
            pressed: button.pressed,
            value: Math.abs(button.value) < deadzone ? 0 : button.value,
          })),
          axes: gamepad.axes.map((axis) =>
            Math.abs(axis) < deadzone ? 0 : axis
          ),
          triggers: {
            left:
              Math.abs(gamepad.buttons[6].value) < deadzone
                ? 0
                : gamepad.buttons[6].value,
            right:
              Math.abs(gamepad.buttons[7].value) < deadzone
                ? 0
                : gamepad.buttons[7].value,
          },
          timestamp: performance.now(),
        };

        const comparisonState = {
          buttons: newState.buttons,
          axes: newState.axes,
          triggers: newState.triggers,
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

    intervalRef.current = setInterval(pollGamepad, 1000 / 60);
  }, [pollGamepad]);

  const handleGamepadConnected = useCallback(
    (event: GamepadEvent) => {
      gamepadIndex.current = event.gamepad.index;
      setIsConnected(true);
      startPolling();
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
      }
    },
    [setIsConnected, setGamepadState]
  );

  useEffect(() => {
    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

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
