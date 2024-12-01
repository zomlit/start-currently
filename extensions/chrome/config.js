
window.config = {
  "SUPABASE_URL": "https://aliddllzqrcpzhiouryw.supabase.co",
  "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsaWRkbGx6cXJjcHpoaW91cnl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1MTE0ODMsImV4cCI6MjA0MDA4NzQ4M30.B20L4mu4OqD9tgdYChGZLpGuPswe7iT3MPCy4-PLGEw"
};

// For module support
if (typeof exports !== 'undefined') {
  exports.config = window.config;
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config: window.config };
}
