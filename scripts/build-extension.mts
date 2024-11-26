import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🔨 Building extension...");

// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.error("❌ Error loading .env file:", result.error);
  process.exit(1);
}

// Create dist directory if it doesn't exist
const distDir = path.resolve(__dirname, "../app/extensions/chrome/dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read the config template
const templatePath = path.resolve(
  __dirname,
  "../app/extensions/chrome/src/config.template.ts"
);
const configDistPath = path.resolve(distDir, "config.js");

console.log("📖 Reading config template from:", templatePath);

try {
  let configContent = fs.readFileSync(templatePath, "utf8");
  console.log("✅ Config template loaded");

  // Replace placeholders with actual values
  configContent = configContent.replace(
    "__SUPABASE_URL__",
    process.env.VITE_PUBLIC_SUPABASE_URL || ""
  );
  configContent = configContent.replace(
    "__SUPABASE_ANON_KEY__",
    process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // Write to dist directory
  fs.writeFileSync(configDistPath, configContent);
  console.log("\n✅ Config file generated in dist directory!");
  console.log("📍 Location:", configDistPath);
} catch (error) {
  console.error("\n❌ Error updating config:", error);
  process.exit(1);
}
