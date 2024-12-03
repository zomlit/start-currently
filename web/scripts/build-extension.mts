import fs from "fs";
import * as fsPromises from "fs/promises";
import path from "path";
import { minify as terserMinify } from "terser";
import { minify as htmlMinify } from "html-minifier";
import AdmZip from "adm-zip";

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
  // For production build, add data-env attribute and remove loading class
  html = html.replace(
    '<div id="root" class="loading',
    '<div id="root" data-env="production" class="'
  );

  return htmlMinify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function zipDistFolder(
  distDir: string,
  outputZipPath: string
): Promise<void> {
  const zip = new AdmZip();

  // Add the entire directory to the zip
  zip.addLocalFolder(distDir);

  // Write the zip file
  zip.writeZip(outputZipPath);
  console.log(`✅ Created zip file: ${outputZipPath}`);
}

async function buildExtension(): Promise<void> {
  console.log("🔨 Building extension...");

  try {
    const extensionDir = path.join(process.cwd(), "extensions/chrome");
    const distDir = path.join(extensionDir, "dist");
    const zipOutputPath = path.join(
      process.cwd(),
      "public/downloads/currently-creator-tools.zip"
    );

    // Ensure dist directory exists first
    await fsPromises.mkdir(distDir, { recursive: true });

    // Generate extension key first (this will create both manifests)
    console.log("Generating extension key...");
    await import("./generate-extension-key.mjs");

    // Build CSS next
    console.log("Building CSS...");
    await import("../extensions/chrome/scripts/build-css.js");

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
          const code = await fsPromises.readFile(sourcePath, "utf-8");
          const minified = await minifyJS(code, file.isModule);
          await fsPromises.writeFile(targetPath, minified);
          console.log(`✅ Minified ${file.name}`);
        } else {
          console.warn(`⚠️ Warning: Source file not found: ${file.name}`);
        }
      } catch (err) {
        console.warn(
          `⚠️ Warning: Could not process ${file.name}:`,
          (err as Error).message
        );
      }
    }

    // Process HTML files with path corrections for dist
    for (const file of htmlFiles) {
      try {
        const sourcePath = path.join(extensionDir, file);
        const targetPath = path.join(distDir, file);

        if (await fileExists(sourcePath)) {
          let html = await fsPromises.readFile(sourcePath, "utf-8");

          // For dist build, remove 'dist/' from resource paths
          if (file === "popup.html") {
            html = html.replace('href="dist/popup.css"', 'href="popup.css"');
          }

          const minified = await minifyHTML(html);
          await fsPromises.writeFile(targetPath, minified);
          console.log(`✅ Minified ${file}`);
        } else {
          console.warn(`⚠️ Warning: Source file not found: ${file}`);
        }
      } catch (err) {
        console.warn(
          `⚠️ Warning: Could not process ${file}:`,
          (err as Error).message
        );
      }
    }

    // Copy directories
    const directoriesToCopy = ["icons", "images", "fonts"];
    for (const dir of directoriesToCopy) {
      try {
        const sourcePath = path.join(extensionDir, dir);
        const targetPath = path.join(distDir, dir);

        if (await fileExists(sourcePath)) {
          await fsPromises.cp(sourcePath, targetPath, {
            recursive: true,
          });
          console.log(`✅ Copied directory ${dir}`);
        } else {
          console.log(`ℹ️ Directory not found (skipping): ${dir}`);
        }
      } catch (err) {
        console.warn(
          `⚠️ Warning: Could not copy ${dir}:`,
          (err as Error).message
        );
      }
    }

    // Build config.js first
    const configTemplatePath = path.join(
      extensionDir,
      "src/config.template.ts"
    );
    const configDistPath = path.join(distDir, "config.js");

    let configContent = await fsPromises.readFile(configTemplatePath, "utf-8");

    // Create a non-module version of config.js
    const configObject = {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    };

    configContent = `
window.config = ${JSON.stringify(configObject, null, 2)};

// For module support
if (typeof exports !== 'undefined') {
  exports.config = window.config;
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config: window.config };
}
`;

    await fsPromises.writeFile(configDistPath, configContent);
    console.log("✅ Built config.js");

    // Copy to extension root
    await fsPromises.copyFile(
      configDistPath,
      path.join(extensionDir, "config.js")
    );

    // Create a zip file from the dist directory
    await zipDistFolder(distDir, zipOutputPath);

    console.log("✅ Extension built successfully!");
  } catch (error) {
    console.error("❌ Failed to build extension:", (error as Error).message);
    process.exit(1);
  }
}

buildExtension();
