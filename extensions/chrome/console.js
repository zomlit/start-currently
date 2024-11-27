// Override console methods to send logs to service worker
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
};

function sendToServiceWorker(type, args) {
  chrome.runtime.sendMessage({
    type: "CONSOLE",
    logType: type,
    args: args.map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg) : String(arg)
    ),
    timestamp: Date.now(),
  });
}

console.log = (...args) => {
  originalConsole.log(...args);
  sendToServiceWorker("log", args);
};

console.error = (...args) => {
  originalConsole.error(...args);
  sendToServiceWorker("error", args);
};

console.warn = (...args) => {
  originalConsole.warn(...args);
  sendToServiceWorker("warn", args);
};

console.info = (...args) => {
  originalConsole.info(...args);
  sendToServiceWorker("info", args);
};
