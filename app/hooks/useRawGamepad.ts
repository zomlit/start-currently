import { useState, useEffect, useRef, useCallback } from "react";

export function useRawGamepad() {
  const [axes, setAxes] = useState<number[]>([0, 0, 0, 0]);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const lastMovementTime = useRef(0);
  const movementTimeout = useRef<NodeJS.Timeout>();
  const prevAxes = useRef([0, 0, 0, 0]);
  const frameRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const axesRef = useRef(axes); // Ref to hold the current axes value

  // Memoize the gamepad update function
  const updateGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[0];

    if (gamepad) {
      const newAxes = [...gamepad.axes];
      const maxMovement = Math.max(
        ...newAxes.map((axis, index) =>
          Math.abs(axis - prevAxes.current[index])
        )
      );

      // Only update state if there's a significant change
      if (JSON.stringify(newAxes) !== JSON.stringify(axesRef.current)) {
        setAxes(newAxes);
        axesRef.current = newAxes; // Update the ref with the new axes
      }

      const INTERACTION_THRESHOLD = 0.15;
      if (maxMovement > INTERACTION_THRESHOLD) {
        lastMovementTime.current = Date.now();
        setIsUserInteracting(true);

        if (movementTimeout.current) {
          clearTimeout(movementTimeout.current);
        }

        movementTimeout.current = setTimeout(() => {
          setIsUserInteracting(false);
        }, 1000);
      }

      prevAxes.current = newAxes;
    }
  }, []); // No dependencies on axes

  // Set up polling in a separate effect
  useEffect(() => {
    const POLL_INTERVAL = 1000 / 60;

    const poll = () => {
      updateGamepad();
      frameRef.current = requestAnimationFrame(poll);
    };

    // Start polling
    frameRef.current = requestAnimationFrame(poll);
    intervalRef.current = setInterval(updateGamepad, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }
    };
  }, [updateGamepad]); // Only depend on the memoized update function

  return { axes, isUserInteracting };
}
