import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "../../../packages/pleey-domain");

const requiredFiles = [
  "package.json",
  "README.md",
  "tsconfig.json",
  "empty.js",
  "empty.cjs",
  "empty.d.ts",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(packageRoot, file))) {
    throw new Error(`Missing shared package file: ${file}`);
  }
}

const packageJsonPath = path.join(packageRoot, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (packageJson.name !== "@pleey/domain") {
  throw new Error(`Unexpected shared package name: ${packageJson.name}`);
}

const expectedExports = [
  ".",
  "./shared/primitives",
  "./identity",
  "./organization",
  "./project",
  "./game",
  "./party",
  "./theme",
  "./media",
  "./errors",
];

for (const entry of expectedExports) {
  if (!packageJson.exports?.[entry]) {
    throw new Error(`Missing shared package export: ${entry}`);
  }
}
