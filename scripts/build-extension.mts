import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { minify as terserMinify } from "terser";
import { minify as htmlMinify } from "html-minifier";

async function minifyJS(
  code: string,
  isModule: boolean = false
): Promise<string> {
  const result = await terserMinify(code, {
    compress: {
      dead_code: true,
      drop_console: false, // Keep console logs for debugging
      drop_debugger: true,
      passes: 2,
    },
    mangle: true,
    format: {
      comments: false,
    },
    module: isModule, // Handle ES modules
  });
  return result.code || code;
}

async function minifyHTML(html: string): Promise<string> {
  return htmlMinify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function buildExtension() {
  console.log("🔨 Building extension...");

  try {
    const extensionDir = path.join(process.cwd(), "extensions/chrome");
    const distDir = path.join(extensionDir, "dist");

    // Ensure dist directory exists
    await fs.mkdir(distDir, { recursive: true });

    // Define file groups for processing
    const jsFiles = [
      { name: "background.js", isModule: true },
      { name: "content.js", isModule: false },
      { name: "popup.js", isModule: false },
      { name: "offscreen.js", isModule: true },
      { name: "offscreen-ready.js", isModule: false },
      { name: "offscreen-init.js", isModule: false },
      { name: "reload-script.js", isModule: false },
      { name: "icon-generator.js", isModule: false },
    ];

    const htmlFiles = ["popup.html", "offscreen.html"];
    const staticFiles = ["manifest.json"];

    // Process JS files
    for (const file of jsFiles) {
      try {
        const sourcePath = path.join(extensionDir, file.name);
        const targetPath = path.join(distDir, file.name);

        if (await fileExists(sourcePath)) {
          const code = await fs.readFile(sourcePath, "utf-8");
          const minified = await minifyJS(code, file.isModule);
          await fs.writeFile(targetPath, minified);
          console.log(`✅ Minified ${file.name}`);
        } else {
          console.warn(`⚠️ Warning: Source file not found: ${file.name}`);
        }
      } catch (err) {
        console.warn(
          `⚠️ Warning: Could not process ${file.name}:`,
          err.message
        );
      }
    }

    // Process HTML files
    for (const file of htmlFiles) {
      try {
        const sourcePath = path.join(extensionDir, file);
        const targetPath = path.join(distDir, file);

        if (await fileExists(sourcePath)) {
          const html = await fs.readFile(sourcePath, "utf-8");
          const minified = await minifyHTML(html);
          await fs.writeFile(targetPath, minified);
          console.log(`✅ Minified ${file}`);
        } else {
          console.warn(`⚠️ Warning: Source file not found: ${file}`);
        }
      } catch (err) {
        console.warn(`⚠️ Warning: Could not process ${file}:`, err.message);
      }
    }

    // Copy static files without modification
    for (const file of staticFiles) {
      try {
        const sourcePath = path.join(extensionDir, file);
        const targetPath = path.join(distDir, file);

        if (await fileExists(sourcePath)) {
          await fs.copyFile(sourcePath, targetPath);
          console.log(`✅ Copied ${file}`);
        } else {
          console.warn(`⚠️ Warning: Source file not found: ${file}`);
        }
      } catch (err) {
        console.warn(`⚠️ Warning: Could not copy ${file}:`, err.message);
      }
    }

    // Copy directories
    const directoriesToCopy = ["icons", "images", "fonts"];
    for (const dir of directoriesToCopy) {
      try {
        const sourcePath = path.join(extensionDir, dir);
        const targetPath = path.join(distDir, dir);

        if (await fileExists(sourcePath)) {
          await fs.cp(sourcePath, targetPath, {
            recursive: true,
          });
          console.log(`✅ Copied directory ${dir}`);
        } else {
          console.log(`ℹ️ Directory not found (skipping): ${dir}`);
        }
      } catch (err) {
        console.warn(`⚠️ Warning: Could not copy ${dir}:`, err.message);
      }
    }

    console.log("✅ Extension built successfully!");
  } catch (error) {
    console.error("❌ Failed to build extension:", error);
    process.exit(1);
  }
}

buildExtension();
