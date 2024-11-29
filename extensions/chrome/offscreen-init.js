// Log that we're loaded
console.log("Offscreen document loaded");

// Keep the document alive
setInterval(() => {
  chrome.runtime.sendMessage({ type: "PING" });
}, 20000);
