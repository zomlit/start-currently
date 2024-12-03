// Remove the import and define types inline
interface GamepadButtonState {
  pressed: boolean;
  value: number;
}

interface GamepadState {
  buttons: GamepadButtonState[];
  axes: number[];
  timestamp?: number;
}

const DEFAULT_DEADZONE = 0.15;

// Remove the local hasSignificantChange function since we're importing it

let frameId: number;
let lastTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
let lastState: GamepadState | null = null;

// Process and send state
const processState = (state: GamepadState) => {
  const now = Date.now();
  if (now - lastTime >= FRAME_TIME) {
    if (hasSignificantChange(state, lastState, DEFAULT_DEADZONE)) {
      self.postMessage({ type: "STATE_UPDATE", state });
      lastState = state;
    }
    lastTime = now;
  }
};

// Handle messages from main thread
self.onmessage = (event) => {
  const { type, state } = event.data;

  switch (type) {
    case "UPDATE_STATE":
      processState(state);
      break;
    case "STOP":
      lastState = null;
      lastTime = 0;
      break;
  }
};

// Keep worker alive
setInterval(() => {
  self.postMessage({ type: "HEARTBEAT" });
}, 1000);
