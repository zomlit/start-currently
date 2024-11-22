// Update these constants
const BROADCAST_INTERVAL = 16; // ~60fps instead of 1000ms
const UPDATE_INTERVAL = 16; // ~60fps

// Update the broadcastGamepadState function
const broadcastGamepadState = useCallback(
  async (state: HookGamepadState) => {
    if (!user?.id || !channelRef.current || !state) return;

    const now = performance.now();
    if (now - lastBroadcastRef.current < BROADCAST_INTERVAL) return;

    const transformedState = transformGamepadState(state);
    lastBroadcastRef.current = now;

    try {
      await channelRef.current.send({
        type: "broadcast",
        event: "gamepadState",
        payload: { gamepadState: transformedState },
      });
    } catch (error) {
      console.error("Error broadcasting gamepad state:", error);
    }
  },
  [user?.id]
);

// Update the RAF effect
useEffect(() => {
  if (!gamepadState) return;

  const updateFrame = () => {
    const now = performance.now();
    if (now - lastUpdateTimeRef.current >= UPDATE_INTERVAL) {
      const transformedState = transformGamepadState(gamepadState);
      setCurrentGamepadState(transformedState);
      broadcastGamepadState(gamepadState);
      lastUpdateTimeRef.current = now;
    }
    frameRef.current = requestAnimationFrame(updateFrame);
  };

  frameRef.current = requestAnimationFrame(updateFrame);

  return () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };
}, [gamepadState, broadcastGamepadState]);
