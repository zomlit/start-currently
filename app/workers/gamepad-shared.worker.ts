let lastState: any = null;
let isProcessing = false;
let connections: Set<MessagePort> = new Set();

// Keep track of actual changes
let lastSentState: string | null = null;
const DRIFT_THRESHOLD = 0.05;
const PROCESS_INTERVAL = 1000 / 60; // 60fps

const hasSignificantChange = (newState: any) => {
  if (!lastSentState) return true;

  const lastState = JSON.parse(lastSentState);

  // Check buttons
  const hasButtonChange = newState.buttons.some(
    (button: boolean, index: number) => button !== lastState.buttons[index]
  );

  // Check axes with threshold
  const hasAxisChange = newState.axes.some(
    (axis: number, index: number) =>
      Math.abs(axis - lastState.axes[index]) > DRIFT_THRESHOLD
  );

  return hasButtonChange || hasAxisChange;
};

const processGamepadState = () => {
  if (!lastState || isProcessing) return;
  isProcessing = true;

  const transformedState = {
    buttons: lastState.buttons.map((button: any) =>
      typeof button === "object" ? button.pressed : button
    ),
    axes: lastState.axes,
  };

  // Only broadcast if there's a significant change
  if (hasSignificantChange(transformedState)) {
    lastSentState = JSON.stringify(transformedState);
    // Broadcast to all connected ports
    connections.forEach((port) => {
      port.postMessage({
        type: "BROADCAST_STATE",
        state: transformedState,
      });
    });
  }

  isProcessing = false;
};

// Handle new connections
self.onconnect = (e) => {
  const port = e.ports[0];
  connections.add(port);

  port.onmessage = (event) => {
    const { type, state } = event.data;

    switch (type) {
      case "UPDATE_STATE":
        lastState = state;
        break;

      case "CLEANUP":
        connections.delete(port);
        if (connections.size === 0) {
          lastState = null;
          lastSentState = null;
        }
        break;
    }
  };

  port.start();
};

// Keep processing even when tab is inactive
const tick = () => {
  processGamepadState();
  setTimeout(tick, PROCESS_INTERVAL);
};

// Start the processing loop
tick();
