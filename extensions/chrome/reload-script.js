window.postMessage(
  {
    source: "GAMEPAD_EXTENSION",
    type: "RELOAD_CONTENT_SCRIPT",
  },
  "*"
);
