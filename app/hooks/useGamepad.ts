import { useState, useEffect, useRef } from "react";

interface GamepadState {
  buttons: {
    pressed: boolean;
    value: number;
  }[];
  axes: number[];
  timestamp: number;
}

export function useGamepad(deadzone: number = 0.1) {
  const [gamepadState, setGamepadState] = useState<GamepadState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const frameRef = useRef<number>();
  const lastState = useRef<string>("");

  useEffect(() => {
    const handleGamepadConnected = () => {
      setIsConnected(true);
    };

    const handleGamepadDisconnected = () => {
      setIsConnected(false);
      setGamepadState(null);
      lastState.current = "";
    };

    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        setIsConnected(true);

        // Create new state
        const newState: GamepadState = {
          buttons: gamepad.buttons.map((button) => ({
            pressed: button.pressed,
            value: Math.abs(button.value) < deadzone ? 0 : button.value,
          })),
          axes: gamepad.axes.map((axis) =>
            Math.abs(axis) < deadzone ? 0 : axis
          ),
          timestamp: performance.now(),
        };

        // Create comparison string without timestamp
        const comparisonState = {
          buttons: newState.buttons,
          axes: newState.axes,
        };
        const newStateString = JSON.stringify(comparisonState);

        // Only update if there are actual changes
        if (newStateString !== lastState.current) {
          lastState.current = newStateString;
          setGamepadState(newState);
        }
      }

      frameRef.current = requestAnimationFrame(handleGamepadInput);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);
    frameRef.current = requestAnimationFrame(handleGamepadInput);

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
  }, [deadzone]);

  return { gamepadState, isConnected };
}
