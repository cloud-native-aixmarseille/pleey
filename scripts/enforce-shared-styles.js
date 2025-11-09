#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const frontendSrc = path.join(repoRoot, "frontend", "src");
const sharedDir = path.join(frontendSrc, "shared");

const CLASS_REGEX = /(\s*)className="([\s\S]*?)"/g;

function normalizeClasses(value) {
  return value.replace(/\s+/g, " ").trim();
}

function shouldSkip(filePath) {
  return filePath.startsWith(sharedDir);
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function ensureRelativeImport(fromPath, targetPath) {
  const relativePath = path.relative(fromPath, targetPath);
  if (relativePath.startsWith(".")) {
    return toPosix(relativePath);
  }
  return `./${toPosix(relativePath)}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findImportEnd(lines) {
  let index = 0;
  let lastImportLine = -1;
  let insideImport = false;

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (
      trimmed === "" ||
      trimmed === "'use client';" ||
      trimmed === '"use client";' ||
      trimmed === "'use strict';" ||
      trimmed === '"use strict";'
    ) {
      index += 1;
      continue;
    }

    if (!insideImport && trimmed.startsWith("import")) {
      insideImport = true;
      lastImportLine = index;
      if (trimmed.endsWith(";")) {
        insideImport = false;
      }
      index += 1;
      continue;
    }

    if (insideImport) {
      lastImportLine = index;
      if (trimmed.endsWith(";")) {
        insideImport = false;
      }
      index += 1;
      continue;
    }

    break;
  }

  if (lastImportLine === -1) {
    return index;
  }

  return lastImportLine + 1;
}

function insertImport(lines, importStatement, targetPath) {
  const importPattern = new RegExp(
    `from\\s+["']${escapeRegExp(targetPath)}["']`
  );
  const existingIndex = lines.findIndex((line) => importPattern.test(line));

  if (existingIndex >= 0) {
    if (lines[existingIndex].includes("createStyles")) {
      return lines;
    }

    const line = lines[existingIndex];
    if (line.includes("{")) {
      lines[existingIndex] = line.replace("{", "{ createStyles, ");
      return lines;
    }

    lines.splice(
      existingIndex,
      1,
      `import { createStyles } from "${targetPath}";`
    );
    return lines;
  }

  const insertionIndex = findImportEnd(lines);
  const updatedLines = [...lines];
  updatedLines.splice(insertionIndex, 0, importStatement);
  return updatedLines;
}

function insertStylesConstant(lines, blockLines) {
  const insertionIndex = findImportEnd(lines);
  const updatedLines = [...lines];
  updatedLines.splice(insertionIndex, 0, ...blockLines);
  return updatedLines;
}

function processFile(filePath) {
  if (!filePath.endsWith(".tsx") || shouldSkip(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");

  if (!raw.includes("className=") || raw.includes("createStyles(")) {
    return;
  }

  const definitions = new Map();
  const occurrences = [];
  let counter = 0;

  for (const match of raw.matchAll(CLASS_REGEX)) {
    const fullMatch = match[0];
    const whitespace = match[1];
    const value = normalizeClasses(match[2]);
    if (!value) {
      continue;
    }

    if (!definitions.has(value)) {
      counter += 1;
      definitions.set(value, { key: `slot${counter}`, original: value });
    }

    occurrences.push({ match: fullMatch, value, whitespace });
  }

  if (definitions.size === 0) {
    return;
  }

  let updated = raw;

  occurrences.forEach(({ match, value, whitespace }) => {
    const { key } = definitions.get(value);
    updated = updated.replace(match, `${whitespace}{...styles.${key}}`);
  });

  const componentName = path.basename(filePath, path.extname(filePath));
  const styleEntries = Array.from(definitions.values()).map(
    ({ key, original }) => `  ${key}: "${original}",`
  );

  const styleBlock = [
    "",
    `const styles = createStyles("${componentName}", {`,
    ...styleEntries,
    "});",
    "",
  ];

  const relativeImportTarget = ensureRelativeImport(
    path.dirname(filePath),
    path.join(frontendSrc, "shared", "ui", "styles")
  );

  const importStatement = `import { createStyles } from "${relativeImportTarget}";`;

  let lines = updated.split("\n");
  lines = insertImport(lines, importStatement, relativeImportTarget);
  lines = insertStylesConstant(lines, styleBlock);

  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      return;
    }
    processFile(fullPath);
  });
}

walk(frontendSrc);
