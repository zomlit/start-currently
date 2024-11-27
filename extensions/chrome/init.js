// Handle font loading
const link = document.createElement("link");
link.rel = "stylesheet";
link.href =
  "https://fonts.googleapis.com/css2?family=Sofia+Sans+Condensed:wght@200..800&display=swap";
document.head.appendChild(link);

// Show content as soon as possible
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    root.classList.remove("loading");
  }
});
