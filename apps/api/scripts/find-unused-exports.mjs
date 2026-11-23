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

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'coverage') {
        continue;
      }
      results.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walk(absRoot);

const isTestFile = (file) =>
  /\.(test|spec|e2e-spec)\.(ts|tsx)$/.test(file) ||
  file.includes('/test-utils/') ||
  file.includes('/test/') ||
  file.includes('__test');

const isBarrelFile = (file) => path.basename(file) === 'index.ts' || path.basename(file) === 'index.tsx';
const isEntryFile = (file) => path.basename(file) === 'main.ts' || path.basename(file) === 'app-module.ts';
const isI18nFile = (file) => file.includes('/i18n/');
const isMigrationFile = (file) => file.includes('/migrations/');
const isSeedFile = (file) => path.basename(file) === 'seed.ts';
const isConfigFile = (file) =>
  /\.(config|setup)\.(ts|mts)$/.test(file) ||
  path.basename(file) === 'codegen.ts' ||
  path.basename(file) === 'prisma.config.ts';
const isGeneratedFile = (file) => file.includes('/generated/');

const exportsByFile = new Map();

const exportPatterns = [
  /export\s+(?:abstract\s+)?class\s+(\w+)/g,
  /export\s+function\s+(\w+)/g,
  /export\s+const\s+(?!enum\b)(\w+)/g,
  /export\s+(?:let|var)\s+(\w+)/g,
  /export\s+(?:const\s+)?enum\s+(\w+)/g,
  /export\s+interface\s+(\w+)/g,
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
      if (
        ['Module', 'Controller', 'Gateway'].some((suffix) => name.endsWith(suffix)) &&
        /\@(Module|Controller|WebSocketGateway)/.test(content)
      ) {
        continue;
      }
      exports.push({ name, pos: match.index });
    }
  }

  if (/export\s+default\s/.test(content)) {
    exports.push({ name: '__default__', pos: 0 });
  }

  if (exports.length > 0) {
    exportsByFile.set(file, exports);
  }
}

const importedByFile = new Map();
const contentCache = new Map();
for (const file of allFiles) {
  contentCache.set(file, fs.readFileSync(file, 'utf-8'));
}

for (const [file, content] of contentCache) {
  const namedImportRe = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+/g;
  let match;
  while ((match = namedImportRe.exec(content)) !== null) {
    const names = match[1]
      .split(',')
      .map((value) => {
        const parts = value.trim().split(/\s+as\s+/);
        return parts[0].trim().replace(/^type\s+/, '');
      })
      .filter(Boolean);
    for (const name of names) {
      if (!importedByFile.has(name)) importedByFile.set(name, new Set());
      importedByFile.get(name).add(file);
    }
  }

  const defaultImportRe = /import\s+(\w+)\s+from\s+/g;
  while ((match = defaultImportRe.exec(content)) !== null) {
    const name = match[1];
    if (name === 'type') continue;
    if (!importedByFile.has(name)) importedByFile.set(name, new Set());
    importedByFile.get(name).add(file);
  }
}

const unused = [];

for (const [file, exports] of exportsByFile) {
  for (const exported of exports) {
    if (exported.name === '__default__') continue;

    const importers = importedByFile.get(exported.name);
    if (!importers) {
      unused.push({ file: path.relative(absRoot, file), name: exported.name, reason: 'never imported' });
      continue;
    }

    const otherNonTestImporters = [...importers].filter((importer) => importer !== file && !isTestFile(importer));
    if (otherNonTestImporters.length === 0) {
      const testImporters = [...importers].filter((importer) => importer !== file && isTestFile(importer));
      const selfImport = importers.has(file);
      if (testImporters.length > 0 && !selfImport) {
        continue;
      }
      if (selfImport && importers.size === 1) {
        continue;
      }
      if (testImporters.length === 0 && !selfImport) {
        unused.push({ file: path.relative(absRoot, file), name: exported.name, reason: 'never imported' });
      }
    }
  }
}

unused.sort((left, right) => left.file.localeCompare(right.file));

console.log(`\nScanned ${allFiles.length} files, found ${exportsByFile.size} files with exports.`);
console.log(`Potentially unused exports: ${unused.length}\n`);

for (const { file, name, reason } of unused) {
  console.log(`  ${file} → ${name} (${reason})`);
}

if (unused.length > 0) {
  process.exitCode = 1;
}