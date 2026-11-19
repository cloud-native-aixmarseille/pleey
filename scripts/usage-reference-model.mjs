import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";

export const repositoryRoot = fs.existsSync(path.resolve(import.meta.dirname, "../application/frontend/package.json"))
  ? path.resolve(import.meta.dirname, "..")
  : "/usr/src/repository";
export const frontendRoot = fs.existsSync(path.join(repositoryRoot, "application/frontend/package.json"))
  ? path.join(repositoryRoot, "application/frontend")
  : "/usr/src/app";
export const frontendRequire = createRequire(path.join(frontendRoot, "package.json"));
export const ts = frontendRequire("typescript");

export function filesUnder(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(file) : [file];
    });
}

// Evaluate repository-owned data modules without starting an application or installing a TS runtime.
export function loadDataModule(filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  const require = (specifier) => {
    if (!specifier.startsWith(".")) throw new Error(`Data modules cannot import packages: ${filename}`);
    const resolvedSpecifier = path.extname(specifier) ? specifier : `${specifier}.ts`;
    return loadDataModule(path.resolve(path.dirname(filename), resolvedSpecifier));
  };
  vm.runInNewContext(output, { exports, require }, { filename, timeout: 1000 });
  return exports;
}

export function readUsageModel(root = repositoryRoot) {
  const presentation = path.join(root, "application/frontend/src/presentation");
  const guides = filesUnder(presentation)
    .filter((file) => file.endsWith(".guide.ts"))
    .map((file) => ({
      ...Object.values(loadDataModule(file))[0],
      source: path.relative(root, file),
    }));
  if (!guides.length) throw new Error("No user guides found.");
  const { TranslationResourceComposer } = loadDataModule(
    path.join(root, "application/frontend/src/i18n/translation-resource-composer.ts"),
  );
  return { guides, resources: new TranslationResourceComposer().compose() };
}

export function translate(resources, locale, key) {
  const value = key.split(".").reduce((node, segment) => node?.[segment], resources[locale]?.translation);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing ${locale} translation: ${key}`);
  return value;
}
