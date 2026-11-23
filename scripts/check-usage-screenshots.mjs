import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { filesUnder, readUsageModel, repositoryRoot } from "./usage-reference-model.mjs";

function usageScreenshotSourceFiles(root) {
  const presentationRoot = path.join(root, "application/web/src/presentation");
  const i18nRoot = path.join(root, "application/web/src/i18n");

  return [
    ...filesUnder(presentationRoot).filter((file) => file.endsWith(".guide.ts")),
    ...filesUnder(i18nRoot).filter((file) => file.endsWith(".ts")),
    path.join(root, "application/web/pnpm-lock.yaml"),
    path.join(root, "e2e/pnpm-lock.yaml"),
    path.join(root, "e2e/tests/usage/guides.spec.ts"),
    path.join(root, "e2e/usage.config.ts"),
    path.join(root, "e2e/playwright.config.ts"),
    path.join(root, "application/api/prisma/seed.ts"),
  ].sort();
}

export function usageScreenshotSourceHash(root = repositoryRoot) {
  const hash = createHash("sha256");
  const files = usageScreenshotSourceFiles(root);
  for (const file of files)
    hash.update(path.relative(root, file)).update("\0").update(fs.readFileSync(file)).update("\0");
  return hash.digest("hex");
}

export function checkUsageScreenshots(root = repositoryRoot) {
  const assets = path.join(root, "docs/usage/assets");
  const manifest = JSON.parse(fs.readFileSync(path.join(assets, "manifest.json"), "utf8"));
  if (manifest.sourceHash !== usageScreenshotSourceHash(root))
    throw new Error("Screenshot inputs changed. Run ./scripts/run-usage-docs.sh capture.");
  const expected = readUsageModel(root)
    .guides.flatMap((guide) =>
      guide.steps.flatMap((step) => ["en", "fr"].map((locale) => `${guide.id}-${step.anchor}-${locale}.png`)),
    )
    .sort();
  if (JSON.stringify(Object.keys(manifest.screenshots).sort()) !== JSON.stringify(expected))
    throw new Error("Screenshot manifest does not match the guide inventory.");
  for (const file of expected) {
    const bytes = fs.readFileSync(path.join(assets, file));
    if (
      bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
      createHash("sha256").update(bytes).digest("hex") !== manifest.screenshots[file]
    )
      throw new Error(`Screenshot changed outside capture: ${file}`);
  }
}
