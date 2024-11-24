import { useState, useEffect, useCallback, useRef } from "react";
import { GamepadState } from "@/types/gamepad";

export function useGamepad(deadzone: number = 0.05) {
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const frameRef = useRef<number | undefined>(undefined);

  const handleGamepadInput = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0]; // Using first gamepad

    if (!gamepad) {
      if (isConnected) {
        setIsConnected(false);
        setGamepadState(null);
      }
      return;
    }

    // Only update if we have a gamepad
    if (!isConnected) {
      setIsConnected(true);
    }

    const buttons = gamepad.buttons.map((button) => ({
      pressed: button.pressed,
      value: button.value,
    }));

    const axes = gamepad.axes.map((axis) =>
      Math.abs(axis) < deadzone ? 0 : axis
    );

    setGamepadState({ buttons, axes });
  }, [deadzone, isConnected]);

  useEffect(() => {
    const updateGamepadState = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= 16) {
        // ~60fps
        handleGamepadInput();
        lastUpdateRef.current = timestamp;
      }
      frameRef.current = requestAnimationFrame(updateGamepadState);
    };

    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log("Gamepad connected:", event.gamepad);
      setIsConnected(true);
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log("Gamepad disconnected:", event.gamepad);
      setIsConnected(false);
      setGamepadState(null);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    frameRef.current = requestAnimationFrame(updateGamepadState);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [handleGamepadInput]);

  return { gamepadState, isConnected };
}
