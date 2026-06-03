/**
 * Scans a directory for exported symbols that are imported ONLY by test files.
 *
 * A symbol that production code never imports - yet tests do - exists solely to
 * satisfy its own tests and provides no end-user value. The exception is code
 * dedicated to testing (test-utils, fixtures, mocks, *.spec/*.test), whose whole
 * purpose IS to serve tests; those are skipped as export sources.
 *
 * Usage: node scripts/check-test-only-exports.mjs <rootDir>
 * Exits with code 1 when test-only exports are found.
 *
 * Complements find-unused-exports.mjs (which reports symbols imported by nobody):
 * this script reports symbols imported by tests but never by production code.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createTypeScriptLanguageService,
  loadTypeScriptFromDirectory,
  loadTypeScriptProjectConfiguration,
  walkFiles,
} from './shared/ts-analysis-harness.mjs';

const exportPatterns = [
  /export\s+(?:abstract\s+)?class\s+(\w+)/g,
  /export\s+function\s+(\w+)/g,
  /export\s+const\s+(?!enum\b)(\w+)/g,
  /export\s+(?:let|var)\s+(\w+)/g,
  /export\s+(?:const\s+)?enum\s+(\w+)/g,
  /export\s+interface\s+(\w+)/g,
  /export\s+type\s+(\w+)\s*[=<{]/g,
];

const RUNTIME_MANAGED_CLASS_DECORATORS = new Set(['Controller', 'Module', 'Resolver', 'WebSocketGateway']);
const RUNTIME_MANAGED_METHOD_DECORATORS = new Set([
  'Delete',
  'EventPattern',
  'Get',
  'GrpcMethod',
  'Head',
  'MessagePattern',
  'Mutation',
  'Options',
  'Patch',
  'Post',
  'Put',
  'Query',
  'ResolveField',
  'ResolveReference',
  'SubscribeMessage',
  'Subscription',
]);
const RUNTIME_LIFECYCLE_METHOD_NAMES = new Set([
  'beforeApplicationShutdown',
  'onApplicationBootstrap',
  'onApplicationShutdown',
  'onModuleDestroy',
  'onModuleInit',
]);

function walk(dir) {
  return walkFiles(dir, { extensions: ['.ts', '.tsx'] }).filter((file) => !file.endsWith('.d.ts'));
}

function getSearchRoots(absRoot) {
  const roots = [absRoot];

  const siblingTestRoot = path.resolve(absRoot, '../test');
  if (path.basename(absRoot) === 'src' && fs.existsSync(siblingTestRoot)) {
    roots.push(siblingTestRoot);
  }

  return [...new Set(roots)];
}

const isTestFile = (file) =>
  /\.(test|spec|e2e-spec|int\.spec)\.(ts|tsx)$/.test(file) ||
  file.includes('/test-utils/') ||
  file.includes('/test/') ||
  file.includes('/fixtures/') ||
  file.includes('/mocks/') ||
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

const isExportSourceIgnored = (file) =>
  isTestFile(file) ||
  isBarrelFile(file) ||
  isEntryFile(file) ||
  isI18nFile(file) ||
  isMigrationFile(file) ||
  isSeedFile(file) ||
  isConfigFile(file) ||
  isGeneratedFile(file);

const splitDestructuredNames = (block) =>
  block
    .split(',')
    .map((value) => value.trim().split(/\s+as\s+/)[0].trim().replace(/^type\s+/, ''))
    .filter((value) => /^\w+$/.test(value));

const stripComments = (content) =>
  content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

const isReusedWithinOwnFile = (name, content) => {
  const occurrenceRe = new RegExp(`\\b${name}\\b`, 'g');
  return (stripComments(content).match(occurrenceRe) ?? []).length > 1;
};

function getDecoratorNames(ts, node) {
  if (!ts.canHaveDecorators(node)) {
    return [];
  }

  return (ts.getDecorators(node) ?? [])
    .map((decorator) => {
      const expression = ts.isCallExpression(decorator.expression)
        ? decorator.expression.expression
        : decorator.expression;

      return ts.isIdentifier(expression) ? expression.text : null;
    })
    .filter((name) => name !== null);
}

function hasModifier(ts, node, modifierFlag) {
  return (ts.getCombinedModifierFlags(node) & modifierFlag) !== 0;
}

function isExportedDeclaration(ts, node) {
  return hasModifier(ts, node, ts.ModifierFlags.Export);
}

function isRuntimeManagedClass(ts, node) {
  return getDecoratorNames(ts, node).some((name) => RUNTIME_MANAGED_CLASS_DECORATORS.has(name));
}

function isRuntimeManagedMethod(ts, node) {
  return getDecoratorNames(ts, node).some((name) => RUNTIME_MANAGED_METHOD_DECORATORS.has(name));
}

function hasImplementsClause(ts, node) {
  return (node.heritageClauses ?? []).some(
    (clause) => clause.token === ts.SyntaxKind.ImplementsKeyword,
  );
}

function isInterfaceMethodCandidateFile(file) {
  return file.includes('/ports/');
}

function collectMethodCandidates(ts, contentCache) {
  const candidates = [];

  for (const [file, content] of contentCache) {
    if (isExportSourceIgnored(file)) {
      continue;
    }

    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    for (const statement of sourceFile.statements) {
      if (ts.isClassDeclaration(statement) && statement.name && isExportedDeclaration(ts, statement)) {
        if (!hasImplementsClause(ts, statement)) {
          continue;
        }

        const skipClassMethods = isRuntimeManagedClass(ts, statement);

        for (const member of statement.members) {
          if (!ts.isMethodDeclaration(member) || !ts.isIdentifier(member.name)) {
            continue;
          }

          if (
            skipClassMethods ||
            hasModifier(ts, member, ts.ModifierFlags.Private) ||
            hasModifier(ts, member, ts.ModifierFlags.Protected) ||
            isRuntimeManagedMethod(ts, member) ||
            RUNTIME_LIFECYCLE_METHOD_NAMES.has(member.name.text)
          ) {
            continue;
          }

          candidates.push({
            end: member.name.getEnd(),
            file,
            kind: 'member',
            name: member.name.text,
            position: member.name.getStart(sourceFile),
          });
        }

        continue;
      }

      if (
        !ts.isInterfaceDeclaration(statement) ||
        !isExportedDeclaration(ts, statement) ||
        !isInterfaceMethodCandidateFile(file)
      ) {
        continue;
      }

      for (const member of statement.members) {
        if (!ts.isMethodSignature(member) || !ts.isIdentifier(member.name)) {
          continue;
        }

        candidates.push({
          end: member.name.getEnd(),
          file,
          kind: 'member',
          name: member.name.text,
          position: member.name.getStart(sourceFile),
        });
      }
    }
  }

  return candidates;
}

function buildDeclarationSpanIndex(candidates) {
  const spansByFile = new Map();

  for (const candidate of candidates) {
    if (!spansByFile.has(candidate.file)) {
      spansByFile.set(candidate.file, []);
    }

    spansByFile.get(candidate.file).push({ end: candidate.end, start: candidate.position });
  }

  return spansByFile;
}

function isDeclarationLikeReference(reference, declarationSpanIndex) {
  const fileSpans = declarationSpanIndex.get(reference.fileName);
  if (!fileSpans) {
    return false;
  }

  return fileSpans.some(
    (span) => span.start === reference.textSpan.start && span.end === reference.textSpan.start + reference.textSpan.length,
  );
}

function collectTestOnlyMembers(absRoot, allFiles, contentCache) {
  const ts = loadTypeScriptFromDirectory(process.cwd());
  const fallbackCompilerOptions = {
    allowJs: false,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
  };
  const { compilerOptions, fileNames } = loadTypeScriptProjectConfiguration(ts, {
    currentDirectory: process.cwd(),
    fallbackCompilerOptions,
    fallbackFileNames: allFiles,
  });
  const languageService = createTypeScriptLanguageService(ts, {
    currentDirectory: process.cwd(),
    fileNames,
    compilerOptions,
  });
  const candidates = collectMethodCandidates(ts, contentCache);
  const declarationSpanIndex = buildDeclarationSpanIndex(candidates);
  const flaggedMembers = [];

  for (const candidate of candidates) {
    const references = languageService.findReferences(candidate.file, candidate.position) ?? [];
    const referenceEntries = references.flatMap((referenceGroup) => referenceGroup.references);
    const nonDefinitionReferences = referenceEntries.filter(
      (reference) => !reference.isDefinition && !isDeclarationLikeReference(reference, declarationSpanIndex),
    );

    if (nonDefinitionReferences.length === 0) {
      continue;
    }

    const productionReferences = nonDefinitionReferences.filter((reference) => !isTestFile(reference.fileName));
    if (productionReferences.length > 0) {
      continue;
    }

    const testReferences = nonDefinitionReferences.filter((reference) => isTestFile(reference.fileName));
    if (testReferences.length === 0) {
      continue;
    }

    flaggedMembers.push({
      file: path.relative(absRoot, candidate.file),
      kind: candidate.kind,
      name: candidate.name,
    });
  }

  languageService.dispose();

  return flaggedMembers;
}

export function runCheckTestOnlyExports(rootDir) {
  if (!rootDir) {
    console.error('Usage: node check-test-only-exports.mjs <rootDir>');
    process.exit(1);
  }

  const absRoot = path.resolve(rootDir);
  const allFiles = getSearchRoots(absRoot).flatMap((directory) => walk(directory));

  const contentCache = new Map();
  for (const file of allFiles) {
    contentCache.set(file, fs.readFileSync(file, 'utf-8'));
  }

  const exportsByFile = new Map();
  for (const [file, content] of contentCache) {
    if (isExportSourceIgnored(file)) {
      continue;
    }

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
        exports.push(name);
      }
    }

    if (exports.length > 0) {
      exportsByFile.set(file, exports);
    }
  }

  const importedByFile = new Map();
  const addImporter = (name, file) => {
    if (!importedByFile.has(name)) {
      importedByFile.set(name, new Set());
    }
    importedByFile.get(name).add(file);
  };

  for (const [file, content] of contentCache) {
    const namedImportRe = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+/g;
    let match;
    while ((match = namedImportRe.exec(content)) !== null) {
      for (const name of splitDestructuredNames(match[1])) {
        addImporter(name, file);
      }
    }

    const defaultImportRe = /import\s+(\w+)\s+from\s+/g;
    while ((match = defaultImportRe.exec(content)) !== null) {
      if (match[1] !== 'type') {
        addImporter(match[1], file);
      }
    }

    const dynamicNamedRe = /{([^}]+)}\s*=\s*await\s+import\s*\(/g;
    while ((match = dynamicNamedRe.exec(content)) !== null) {
      for (const name of splitDestructuredNames(match[1])) {
        addImporter(name, file);
      }
    }

    const promiseAllRe = /\[([\s\S]*?)\]\s*=\s*await\s+Promise\.all\s*\(/g;
    while ((match = promiseAllRe.exec(content)) !== null) {
      const blockRe = /{([^}]+)}/g;
      let blockMatch;
      while ((blockMatch = blockRe.exec(match[1])) !== null) {
        for (const name of splitDestructuredNames(blockMatch[1])) {
          addImporter(name, file);
        }
      }
    }
  }

  const testOnly = [];
  for (const [file, exports] of exportsByFile) {
    const content = contentCache.get(file);
    for (const name of exports) {
      const importers = importedByFile.get(name);
      if (!importers) {
        continue;
      }

      const externalImporters = [...importers].filter((importer) => importer !== file);
      if (externalImporters.length === 0) {
        continue;
      }

      const productionImporters = externalImporters.filter((importer) => !isTestFile(importer));
      if (productionImporters.length > 0) {
        continue;
      }

      if (isReusedWithinOwnFile(name, content)) {
        continue;
      }

      testOnly.push({ file: path.relative(absRoot, file), name });
    }
  }

  const testOnlyMembers = collectTestOnlyMembers(absRoot, allFiles, contentCache);
  const testOnlySymbols = [
    ...testOnly.map((entry) => ({ ...entry, kind: 'export' })),
    ...testOnlyMembers,
  ];

  testOnlySymbols.sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      left.name.localeCompare(right.name) ||
      left.kind.localeCompare(right.kind),
  );

  console.log(`\nScanned ${allFiles.length} files, inspected ${exportsByFile.size} production files with exports.`);
  console.log(`Symbols used only by tests: ${testOnlySymbols.length}\n`);

  for (const { file, kind, name } of testOnlySymbols) {
    const usageLabel = kind === 'member' ? 'only referenced by tests' : 'only imported by tests';
    console.log(`  ${file} -> ${name} (${kind}, ${usageLabel})`);
  }

  if (testOnlySymbols.length > 0) {
    console.log(
      '\nThese symbols have no production consumer. Remove them (and their tests),' +
        '\nor move genuinely test-dedicated helpers into a test-utils/fixtures/mocks folder.',
    );
    process.exitCode = 1;
  }

  return testOnlySymbols;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCheckTestOnlyExports(process.argv[2]);
}