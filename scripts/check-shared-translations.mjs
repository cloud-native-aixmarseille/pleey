import fs from "node:fs";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const packageRootCandidates = [
  path.join(workspaceRoot, "application/shared"),
  "/usr/src/shared",
];
const packageRoot = packageRootCandidates.find((candidate) => fs.existsSync(candidate));

if (!packageRoot) {
  throw new Error(`Unable to locate shared domain package. Checked: ${packageRootCandidates.join(", ")}`);
}

const { SHARED_ERROR_TRANSLATION_KEYS, SHARED_TRANSLATIONS } = await import(
  new URL(`file://${path.join(packageRoot, "i18n/index.ts")}`)
);
const { PredictionErrorCode, QuizErrorCode } = await import(
  new URL(`file://${path.join(packageRoot, "errors/index.ts")}`)
);
const write = process.argv.includes("--write");

const backendRootCandidates = [
  path.join(workspaceRoot, "application/backend"),
  "/usr/src/app",
];
const backendRoot = backendRootCandidates.find((candidate) => fs.existsSync(path.join(candidate, "src/i18n")));

if (!backendRoot) {
  throw new Error(`Unable to locate backend i18n resources. Checked: ${backendRootCandidates.join(", ")}`);
}

const errorCodes = [...Object.values(QuizErrorCode), ...Object.values(PredictionErrorCode)];
const localeNames = Object.keys(SHARED_TRANSLATIONS).sort();

function resolveTranslation(resources, key) {
  return key.split(".").reduce((current, part) => current?.[part], resources);
}

for (const code of errorCodes) {
  const key = SHARED_ERROR_TRANSLATION_KEYS[code];
  if (typeof key !== "string" || key.length === 0) {
    throw new Error(`Missing translation key for shared error code "${code}".`);
  }
  for (const locale of localeNames) {
    if (typeof resolveTranslation(SHARED_TRANSLATIONS[locale], key) !== "string") {
      throw new Error(`Missing ${locale} translation for shared error code "${code}" (${key}).`);
    }
  }
}

const staleCodes = Object.keys(SHARED_ERROR_TRANSLATION_KEYS).filter((code) => !errorCodes.includes(code));
if (staleCodes.length > 0) {
  throw new Error(`Translation keys reference non-exported shared error codes: ${staleCodes.join(", ")}.`);
}

const mismatches = [];
for (const locale of localeNames) {
  for (const namespace of ["quiz", "prediction"]) {
    const outputPath = path.join(backendRoot, "src/i18n", locale, `${namespace}.json`);
    const expected = `${JSON.stringify({ errors: SHARED_TRANSLATIONS[locale][namespace].errors }, null, 2)}\n`;
    if (write) {
      fs.writeFileSync(outputPath, expected);
      continue;
    }
    const actual = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
    if (actual !== expected) mismatches.push(path.relative(workspaceRoot, outputPath));
  }
}

if (mismatches.length > 0) {
  throw new Error(
    `Generated backend translations are stale: ${mismatches.join(", ")}. Regenerate from application/shared/i18n/index.ts.`,
  );
}
