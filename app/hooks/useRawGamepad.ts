import { useState, useEffect, useRef } from "react";

export function useRawGamepad() {
  const [axes, setAxes] = useState<number[]>([0, 0, 0, 0]);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const lastMovementTime = useRef(0);
  const movementTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let animationFrameId: number;
    const INTERACTION_THRESHOLD = 0.15; // Threshold for intentional movement
    const IDLE_TIMEOUT = 2000; // Time in ms to consider stick returned to rest

    const updateGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        const newAxes = [...gamepad.axes];
        setAxes(newAxes);

        // Check for significant stick movement
        const hasSignificantMovement = newAxes.some(
          (axis) => Math.abs(axis) > INTERACTION_THRESHOLD
        );

        if (hasSignificantMovement) {
          lastMovementTime.current = Date.now();
          setIsUserInteracting(true);

          // Clear any existing timeout
          if (movementTimeout.current) {
            clearTimeout(movementTimeout.current);
          }

          // Set new timeout
          movementTimeout.current = setTimeout(() => {
            setIsUserInteracting(false);
          }, IDLE_TIMEOUT);
        }
      }

      animationFrameId = requestAnimationFrame(updateGamepad);
    };

    animationFrameId = requestAnimationFrame(updateGamepad);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }
    };
  }, []);

  return { axes, isUserInteracting };
}
