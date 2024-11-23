interface WorkerGamepadState {
  buttons: boolean[];
  axes: number[];
}

let currentState: WorkerGamepadState | null = null;
let processingState = false;

const SEND_INTERVAL = 1000 / 60; // 60fps

// Process and send state
const processState = () => {
  if (!currentState || processingState) return;
  processingState = true;

  self.postMessage({
    type: "SEND_STATE",
    state: currentState,
  });

  processingState = false;
};

// Handle messages from main thread
self.onmessage = (event) => {
  const { type, state } = event.data;

  if (type === "UPDATE_STATE") {
    currentState = state;
  }
};

// Keep sending state at a fixed interval
setInterval(processState, SEND_INTERVAL);

// Keep worker alive
setInterval(() => {
  self.postMessage({ type: "HEARTBEAT" });
}, 1000);
