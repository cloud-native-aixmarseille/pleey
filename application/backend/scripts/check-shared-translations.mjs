import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const candidates = [
  path.resolve(import.meta.dirname, "../../../scripts/check-shared-translations.mjs"),
  "/usr/src/shared-scripts/check-shared-translations.mjs",
];
const scriptPath = candidates.find((candidate) => fs.existsSync(candidate));

if (!scriptPath) {
  throw new Error("Unable to locate the shared translation checker.");
}

await import(pathToFileURL(scriptPath).href);
