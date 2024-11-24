import { useState, useEffect, useCallback, useRef } from "react";

interface RawGamepadState {
  axes: number[];
  isUserInteracting: boolean;
}

export function useRawGamepad(deadzone: number = 0.05) {
  const [state, setState] = useState<RawGamepadState>({
    axes: Array(4).fill(0),
    isUserInteracting: false,
  });

  const lastUpdateRef = useRef<number>(0);
  const frameRef = useRef<number | undefined>(undefined);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleGamepadInput = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];

    if (!gamepad) return;

    const axes = gamepad.axes.map((axis) =>
      Math.abs(axis) < deadzone ? 0 : axis
    );

    // Only update state if axes have changed
    setState((prev) => {
      const hasChanged = axes.some((axis, i) => axis !== prev.axes[i]);
      if (!hasChanged) return prev;

      const isInteracting = axes.some((axis) => Math.abs(axis) > deadzone);

      // Clear existing timeout
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }

      // Set new timeout if user is interacting
      if (isInteracting) {
        interactionTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, isUserInteracting: false }));
        }, 1000);
      }

      return {
        axes,
        isUserInteracting: isInteracting,
      };
    });
  }, [deadzone]);

  useEffect(() => {
    const updateGamepadState = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= 16) {
        // ~60fps
        handleGamepadInput();
        lastUpdateRef.current = timestamp;
      }
      frameRef.current = requestAnimationFrame(updateGamepadState);
    };

    frameRef.current = requestAnimationFrame(updateGamepadState);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [handleGamepadInput]);

  return {
    axes: state.axes,
    isUserInteracting: state.isUserInteracting,
  };
}
