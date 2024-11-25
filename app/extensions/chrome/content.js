// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Content] Received message:", message);

  if (message.type === "GAMEPAD_STATE") {
    // Forward the gamepad state to the webpage
    window.postMessage(
      {
        source: "GAMEPAD_EXTENSION",
        type: "GAMEPAD_STATE",
        state: message.state,
        timestamp: message.timestamp,
      },
      "*"
    );
    sendResponse({ success: true });
  } else if (message.type === "CHANNEL_READY") {
    // Forward channel info to the webpage
    window.postMessage(
      {
        source: "GAMEPAD_EXTENSION",
        type: "CHANNEL_READY",
        channelId: message.channelId,
        username: message.username,
      },
      "*"
    );
    sendResponse({ success: true });
  }

  return true;
});

// Listen for messages from the webpage
window.addEventListener("message", (event) => {
  // Only accept messages from our window
  if (event.source !== window) return;
  if (event.data.source !== "GAMEPAD_WEBPAGE") return;

  console.log("[Content] Forwarding message to extension:", event.data);
  chrome.runtime.sendMessage(event.data.message);
});

// Notify webpage that content script is ready
window.postMessage(
  {
    source: "GAMEPAD_EXTENSION",
    type: "CONTENT_SCRIPT_READY",
  },
  "*"
);
