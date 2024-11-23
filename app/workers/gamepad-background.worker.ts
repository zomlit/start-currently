let lastState: any = null;
let isProcessing = false;
let userId: string | null = null;
let username: string | null = null;

// Keep processing even when tab is in background
const PROCESS_INTERVAL = 1000 / 60; // 60fps

const processGamepadState = (state: any) => {
  if (isProcessing) return;
  isProcessing = true;

  self.postMessage({
    type: "BROADCAST_STATE",
    state: {
      buttons: state.buttons,
      axes: state.axes,
    },
  });

  isProcessing = false;
};

// Handle messages from main thread
self.onmessage = (event) => {
  const { type, state, userId: newUserId, username: newUsername } = event.data;

  switch (type) {
    case "INIT":
      userId = newUserId;
      username = newUsername;
      break;

    case "UPDATE_STATE":
      lastState = state;
      processGamepadState(state);
      break;

    default:
      break;
  }
};

// Keep processing in background
setInterval(() => {
  if (lastState) {
    processGamepadState(lastState);
  }
}, PROCESS_INTERVAL);
