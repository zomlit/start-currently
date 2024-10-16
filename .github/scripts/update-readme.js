const fs = require("fs");
const path = require("path");

const packageJson = require("../../package.json");
const readmePath = path.join(__dirname, "../../README.md");

let readme = fs.readFileSync(readmePath, "utf8");

const dependenciesToUpdate = [
  "react",
  "tailwindcss",
  "@tanstack/react-start",
  "@tanstack/react-router",
  "@tanstack/react-query",
  "@clerk/clerk-react",
  "framer-motion",
];

dependenciesToUpdate.forEach((dep) => {
  const version =
    packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  if (version) {
    const regex = new RegExp(`${dep}:\\s*\\^?\\d+\\.\\d+\\.\\d+(-\\w+)?`, "g");
    readme = readme.replace(regex, `${dep}: ${version}`);
  }
});

fs.writeFileSync(readmePath, readme);
