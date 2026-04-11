/**
 * Scans a directory for exported symbols (classes, functions, constants, types, interfaces, enums, React components)
 * and reports any that are never imported by another file.
 *
 * Usage: node scripts/find-unused-exports.mjs <rootDir>
 * Exits with code 1 when unused exports are found.
 *
 * - Ignores barrel/index files as sources of exports (they re-export).
 * - Ignores test files as consumers (they are allowed to be the sole importer).
 * - Skips main entry points (main.ts, index.ts at root).
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.argv[2];
if (!rootDir) {
  console.error('Usage: node find-unused-exports.mjs <rootDir>');
  process.exit(1);
}

const absRoot = path.resolve(rootDir);

// Collect all TS/TSX files under root
function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'coverage') continue;
      results.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walk(absRoot);

const isTestFile = (f) =>
  /\.(test|spec|e2e-spec)\.(ts|tsx)$/.test(f) ||
  f.includes('/test-utils/') ||
  f.includes('/test/') ||
  f.includes('__test');

const isBarrelFile = (f) => path.basename(f) === 'index.ts' || path.basename(f) === 'index.tsx';
const isEntryFile = (f) => path.basename(f) === 'main.ts' || path.basename(f) === 'app-module.ts';
const isI18nFile = (f) => f.includes('/i18n/');
const isMigrationFile = (f) => f.includes('/migrations/');
const isSeedFile = (f) => path.basename(f) === 'seed.ts';
const isConfigFile = (f) => /\.(config|setup)\.(ts|mts)$/.test(f) || path.basename(f) === 'codegen.ts' || path.basename(f) === 'prisma.config.ts';
const isGeneratedFile = (f) => f.includes('/generated/');

// Phase 1: Extract named exports from source files (not tests, not barrels)
const exportsByFile = new Map(); // file -> [{ name, line }]

const exportPatterns = [
  // export class Foo / export abstract class Foo
  /export\s+(?:abstract\s+)?class\s+(\w+)/g,
  // export function foo
  /export\s+function\s+(\w+)/g,
  // export const/let/var foo, but not export const enum Foo
  /export\s+const\s+(?!enum\b)(\w+)/g,
  /export\s+(?:let|var)\s+(\w+)/g,
  // export enum Foo / export const enum Foo
  /export\s+(?:const\s+)?enum\s+(\w+)/g,
  // export interface Foo
  /export\s+interface\s+(\w+)/g,
  // export type Foo
  /export\s+type\s+(\w+)\s*[=<{]/g,
];

for (const file of allFiles) {
  if (isTestFile(file)) continue;
  if (isBarrelFile(file)) continue;
  if (isEntryFile(file)) continue;
  if (isI18nFile(file)) continue;
  if (isMigrationFile(file)) continue;
  if (isSeedFile(file)) continue;
  if (isConfigFile(file)) continue;
  if (isGeneratedFile(file)) continue;

  const content = fs.readFileSync(file, 'utf-8');
  const exports = [];

  for (const pattern of exportPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      // Skip common NestJS lifecycle/decorator symbols that are always used implicitly
      if (['Module', 'Controller', 'Gateway'].some(s => name.endsWith(s)) && /\@(Module|Controller|WebSocketGateway)/.test(content)) continue;
      exports.push({ name, pos: match.index });
    }
  }

  // Also detect: export default
  if (/export\s+default\s/.test(content)) {
    exports.push({ name: '__default__', pos: 0 });
  }

  if (exports.length > 0) {
    exportsByFile.set(file, exports);
  }
}

// Phase 2: Build a map of all import references across all source files (including tests as consumers)
// We look for:
//   import { Foo } from '...'
//   import Foo from '...'
//   import type { Foo } from '...'
//   Also dynamic: container.fooService, useXxx, etc.

const importedNames = new Set();
const importedByFile = new Map(); // name -> Set<file>

// Build content cache for all files
const contentCache = new Map();
for (const file of allFiles) {
  contentCache.set(file, fs.readFileSync(file, 'utf-8'));
}

// Extract all import names
for (const [file, content] of contentCache) {
  // Named imports: import { A, B, C } from '...'
  const namedImportRe = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+/g;
  let m;
  while ((m = namedImportRe.exec(content)) !== null) {
    const names = m[1].split(',').map(n => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[0].trim().replace(/^type\s+/, '');
    }).filter(Boolean);
    for (const name of names) {
      importedNames.add(name);
      if (!importedByFile.has(name)) importedByFile.set(name, new Set());
      importedByFile.get(name).add(file);
    }
  }

  // Default imports: import Foo from '...'
  const defaultImportRe = /import\s+(\w+)\s+from\s+/g;
  while ((m = defaultImportRe.exec(content)) !== null) {
    const name = m[1];
    if (name === 'type') continue;
    importedNames.add(name);
    if (!importedByFile.has(name)) importedByFile.set(name, new Set());
    importedByFile.get(name).add(file);
  }
}

// Phase 3: Find exports that are never imported by any other file
const unused = [];

for (const [file, exports] of exportsByFile) {
  for (const exp of exports) {
    if (exp.name === '__default__') continue; // skip default exports for now

    const importers = importedByFile.get(exp.name);
    if (!importers) {
      // Not imported anywhere at all
      unused.push({ file: path.relative(absRoot, file), name: exp.name, reason: 'never imported' });
      continue;
    }

    // Check if imported only by the file itself or only by test files
    const otherNonTestImporters = [...importers].filter(f => f !== file && !isTestFile(f));
    if (otherNonTestImporters.length === 0) {
      // Could be imported only by tests or self
      const testImporters = [...importers].filter(f => f !== file && isTestFile(f));
      const selfImport = importers.has(file);
      if (testImporters.length > 0 && !selfImport) {
        // Only tests import it - that's fine for many things, skip
        continue;
      }
      if (selfImport && importers.size === 1) {
        // Only self-imports (type used in same file) - skip
        continue;
      }
      if (testImporters.length === 0 && !selfImport) {
        unused.push({ file: path.relative(absRoot, file), name: exp.name, reason: 'never imported' });
      }
    }
    // else: has non-test consumers, it's used
  }
}

// Sort by file
unused.sort((a, b) => a.file.localeCompare(b.file));

console.log(`\nScanned ${allFiles.length} files, found ${exportsByFile.size} files with exports.`);
console.log(`Potentially unused exports: ${unused.length}\n`);

for (const { file, name, reason } of unused) {
  console.log(`  ${file} → ${name} (${reason})`);
}

if (unused.length > 0) {
  process.exitCode = 1;
}
