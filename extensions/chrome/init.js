// Handle font loading
const link = document.createElement("link");
link.rel = "stylesheet";
link.href =
  "https://fonts.googleapis.com/css2?family=Sofia+Sans+Condensed:wght@200..800&display=swap";
document.head.appendChild(link);

// Show content as soon as possible
document.addEventListener("DOMContentLoaded", () => {
  // Wait for a brief moment to ensure styles are applied
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const root = document.getElementById("root");
      if (root) {
        root.classList.remove("loading");
      }
    });
  });
});

// Fallback to remove loading class after a timeout
setTimeout(() => {
  const root = document.getElementById("root");
  if (root && root.classList.contains("loading")) {
    root.classList.remove("loading");
  }
}, 1000);
