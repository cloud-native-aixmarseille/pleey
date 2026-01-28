import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const SHARED_SOURCE_EXTENSIONS = ['.ts', '.tsx'];

function parseTestFileName(filePath) {
  const match = path
    .basename(filePath)
    .match(/^(?<sourceStem>.+?)(?<integration>\.int)?\.(?<kind>spec|test)\.(?<extension>ts|tsx)$/);
  if (!match?.groups) {
    return null;
  }

  return {
    sourceStem: match.groups.sourceStem,
    testMarker: `${match.groups.integration ?? ''}.${match.groups.kind}`,
    extension: `.${match.groups.extension}`,
  };
}

function extractSourceSymbol(content) {
  const declarationPatterns = [
    /export\s+class\s+([A-Z][A-Za-z0-9]*)\b/g,
    /export\s+default\s+function\s+([A-Z][A-Za-z0-9]*)\b/g,
    /export\s+function\s+([A-Z][A-Za-z0-9]*)\b/g,
    /export\s+const\s+([A-Z][A-Za-z0-9]*)\s*(?::[^=]+)?=/g,
  ];
  const contractPatterns = [
    /export\s+interface\s+([A-Z][A-Za-z0-9]*)\b/g,
    /export\s+type\s+([A-Z][A-Za-z0-9]*)\b/g,
  ];
  const runtimeExportPatterns = [
    /export\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g,
    /export\s+default\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g,
    /export\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g,
    /export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?::[^=]+)?=/g,
  ];
  const providerSymbolPattern =
    /export\s+const\s+[A-Za-z_$][A-Za-z0-9_$]*Provider\s*(?::[^=]+)?=\s*Symbol\((['"`])([A-Z][A-Za-z0-9]*)\1\)/g;

  const runtimeExports = [];
  for (const pattern of runtimeExportPatterns) {
    for (const match of content.matchAll(pattern)) {
      runtimeExports.push(match[1]);
    }
  }

  const uniqueRuntimeExports = [...new Set(runtimeExports)];
  if (uniqueRuntimeExports.length !== 1) {
    return null;
  }

  const directCanonicalRuntimeSymbols = uniqueRuntimeExports.filter(
    (symbol) =>
      /^[A-Z][A-Za-z0-9]*$/.test(symbol) &&
      /[a-z]/.test(symbol) &&
      !symbol.endsWith('Provider') &&
      !symbol.startsWith('Abstract'),
  );
  if (directCanonicalRuntimeSymbols.length === 1) {
    return directCanonicalRuntimeSymbols[0];
  }

  const providerTargets = [...content.matchAll(providerSymbolPattern)].map((match) => match[2]);
  const declarationSymbols = [];
  for (const pattern of declarationPatterns) {
    for (const match of content.matchAll(pattern)) {
      declarationSymbols.push(match[1]);
    }
  }
  const contractSymbols = [];
  for (const pattern of contractPatterns) {
    for (const match of content.matchAll(pattern)) {
      contractSymbols.push(match[1]);
    }
  }

  const uniqueProviderTargets = [...new Set(providerTargets)];
  const uniqueDeclarationSymbols = [...new Set(declarationSymbols)].filter(
    (symbol) => /[a-z]/.test(symbol) && !symbol.endsWith('Provider'),
  );
  const uniqueContractSymbols = [...new Set(contractSymbols)].filter((symbol) => /[a-z]/.test(symbol));

  if (uniqueDeclarationSymbols.length > 1) {
    return null;
  }

  if (
    uniqueProviderTargets.length === 1 &&
    ((uniqueContractSymbols.length === 0 && uniqueDeclarationSymbols.length === 0) ||
      (uniqueContractSymbols.length === 1 && uniqueContractSymbols[0] === uniqueProviderTargets[0]))
  ) {
    return uniqueProviderTargets[0];
  }

  return null;
}

function extractTopLevelDescribe(content) {
  const match = content.match(/[A-Za-z0-9_.]*describe[A-Za-z0-9_.]*\((['"`])([^'"`]+)\1/);
  return match?.[2] ?? null;
}

function shouldEnforceDescribe(_title, sourceSymbol) {
  return Boolean(sourceSymbol);
}

const SHARED_PROJECT_CONFIG = {
  sourceExtensions: SHARED_SOURCE_EXTENSIONS,
  parseTestFileName,
  extractSourceSymbol,
  extractTopLevelDescribe,
  shouldEnforceDescribe,
};

const PROJECT_DEFINITIONS = {
  frontend: {
    directory: 'application/frontend',
    roots: ['src', 'test'],
    label: 'Frontend',
  },
  backend: {
    directory: 'application/backend',
    roots: ['src', 'test'],
    label: 'Backend',
  },
};

const PROJECTS = Object.fromEntries(
  Object.entries(PROJECT_DEFINITIONS).map(([projectName, definition]) => [
    projectName,
    {
      ...SHARED_PROJECT_CONFIG,
      root: path.join(workspaceRoot, definition.directory),
      roots: definition.roots,
      successMessage: `${definition.label} naming checks passed.`,
      failureMessage: `${definition.label} naming checks failed:`,
    },
  ]),
);

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(absolutePath, files);
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function toWorkspaceRelative(projectRoot, filePath) {
  return toPosix(path.relative(projectRoot, filePath));
}

function toKebabCase(symbol) {
  return symbol.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function removeTypeScriptExtension(filePath) {
  return filePath.replace(/\.(ts|tsx)$/, '');
}

function getBaseNameWithoutExtension(filePath) {
  return path.basename(removeTypeScriptExtension(filePath));
}

function violatesFrontendApplicationServiceBoundary(relativePath) {
  return /^src\/application\/.*\/services\//.test(relativePath);
}

function violatesFrontendAppServiceNaming(relativePath) {
  return /^src\/app\/.*\.service\.(ts|tsx)$/.test(relativePath);
}

function violatesFrontendAppAdapterNaming(relativePath) {
  return /^src\/app\/.*(?:\.adapter\.(ts|tsx)|.*adapters\/)/.test(relativePath);
}

function extractImportSources(content) {
  const importSourcePattern = /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g;
  return [...content.matchAll(importSourcePattern)].map((match) => match[1]);
}

function findFrontendBypassedSharedWrapperImports(relativePath, importSources) {
  if (!/^src\/presentation\//.test(relativePath) || /^src\/presentation\/shared\//.test(relativePath)) {
    return [];
  }

  const bannedSources = [
    '@tanstack/react-form',
    '@radix-ui/react-label',
    '@radix-ui/react-slot',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ];

  return importSources.filter((source) => bannedSources.includes(source));
}

function normalizeBaseName(baseName) {
  return baseName.replace(/\./g, '-');
}

function buildSourceStemCandidates(sourceStem) {
  const candidates = [];
  let currentStem = sourceStem;

  while (true) {
    candidates.push(currentStem);

    const lastSeparatorIndex = currentStem.lastIndexOf('.');
    if (lastSeparatorIndex === -1) {
      break;
    }

    currentStem = currentStem.slice(0, lastSeparatorIndex);
  }

  return candidates;
}

function buildSourceExtensionPriority(project, parsedTestFileName) {
  const extensions = [parsedTestFileName.extension, ...project.sourceExtensions];
  return [...new Set(extensions)];
}

function resolveSourceFileFromTest(project, testFilePath, parsedTestFileName) {
  const directory = path.dirname(testFilePath);
  const stemCandidates = buildSourceStemCandidates(parsedTestFileName.sourceStem);
  const extensionCandidates = buildSourceExtensionPriority(project, parsedTestFileName);

  for (const stemCandidate of stemCandidates) {
    for (const extensionCandidate of extensionCandidates) {
      const sourceCandidatePath = path.join(directory, `${stemCandidate}${extensionCandidate}`);
      if (fs.existsSync(sourceCandidatePath)) {
        return sourceCandidatePath;
      }
    }
  }

  return null;
}

function isValidTestBaseName(actualBaseName, expectedSourceBaseName, parsedTestFileName) {
  if (!actualBaseName.endsWith(parsedTestFileName.testMarker)) {
    return false;
  }

  const testNamePrefix = actualBaseName.slice(0, -parsedTestFileName.testMarker.length);
  const normalizedPrefix = normalizeBaseName(testNamePrefix);
  return (
    normalizedPrefix === expectedSourceBaseName ||
    normalizedPrefix.startsWith(`${expectedSourceBaseName}-`)
  );
}

function hasSideBySideTest(sourceFilePath) {
  const directory = path.dirname(sourceFilePath);
  const sourceBaseName = normalizeBaseName(getBaseNameWithoutExtension(sourceFilePath));

  return fs.readdirSync(directory).some((entry) => {
    const parsedTestFileName = parseTestFileName(entry);
    if (!parsedTestFileName) {
      return false;
    }

    return normalizeBaseName(parsedTestFileName.sourceStem) === sourceBaseName;
  });
}

function requiresFrontendSideBySideTest(relativePath, filePath, symbol) {
  if (/^src\/infrastructure\/graphql\/generated\//.test(relativePath)) {
    return false;
  }

  if (/^src\/domains\/.*\.(ts|tsx)$/.test(relativePath)) {
    return Boolean(symbol);
  }

  if (/^src\/presentation\/.*\.tsx$/.test(relativePath)) {
    return true;
  }

  if (/^src\/infrastructure\/.*\.(ts|tsx)$/.test(relativePath)) {
    return Boolean(symbol);
  }

  return false;
}

export function runProject(projectName) {
  const project = PROJECTS[projectName];
  if (!project) {
    console.error(`Unknown project '${projectName}'. Expected one of: ${Object.keys(PROJECTS).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const roots = project.roots
    .map((directory) => path.join(project.root, directory))
    .filter((directory) => fs.existsSync(directory));
  const failures = [];
  const files = roots.flatMap((directory) => walk(directory));

  for (const filePath of files) {
    const relativePath = toWorkspaceRelative(project.root, filePath);

    if (projectName === 'frontend' && violatesFrontendApplicationServiceBoundary(relativePath)) {
      failures.push(
        `${relativePath}: application layer must not define services; move this module under src/domains/**/services or model it as a use-case instead.`,
      );
    }

    if (projectName === 'frontend' && violatesFrontendAppServiceNaming(relativePath)) {
      failures.push(
        `${relativePath}: src/app must not define *.service modules; use runtime, binding, or composition module names instead.`,
      );
    }

    if (projectName === 'frontend' && violatesFrontendAppAdapterNaming(relativePath)) {
      failures.push(
        `${relativePath}: src/app must not define adapter modules or adapters folders; use runtime, binding, or composition module names instead.`,
      );
    }

    const parsedTestFileName = project.parseTestFileName(filePath);

    if (parsedTestFileName) {
      const sourceFilePath = resolveSourceFileFromTest(project, filePath, parsedTestFileName);
      if (!sourceFilePath) {
        continue;
      }

      const sourceContent = fs.readFileSync(sourceFilePath, 'utf8');
      const sourceSymbol = project.extractSourceSymbol(sourceContent);
      if (!sourceSymbol) {
        continue;
      }

      const actualBaseName = path.basename(filePath).replace(/\.(ts|tsx)$/, '');
      const expectedSourceBaseName = toKebabCase(sourceSymbol);
      if (!isValidTestBaseName(actualBaseName, expectedSourceBaseName, parsedTestFileName)) {
        failures.push(
          `${relativePath}: expected test file name to start with ${expectedSourceBaseName} and end with ${parsedTestFileName.testMarker}${path.extname(filePath)} for ${sourceSymbol}`,
        );
      }

      const topLevelDescribe = project.extractTopLevelDescribe(fs.readFileSync(filePath, 'utf8'));
      if (project.shouldEnforceDescribe(topLevelDescribe, sourceSymbol) && topLevelDescribe !== sourceSymbol) {
        failures.push(`${relativePath}: expected top-level describe to be ${sourceSymbol}`);
      }

      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const symbol = project.extractSourceSymbol(content);
    const bypassedSharedWrapperImports =
      projectName === 'frontend'
        ? findFrontendBypassedSharedWrapperImports(relativePath, extractImportSources(content))
        : [];

    if (bypassedSharedWrapperImports.length > 0) {
      failures.push(
        `${relativePath}: presentation feature code must consume shared wrappers from src/presentation/shared/** instead of importing ${bypassedSharedWrapperImports.join(', ')} directly.`,
      );
    }

    if (
      projectName === 'frontend' &&
      requiresFrontendSideBySideTest(relativePath, filePath, symbol) &&
      !hasSideBySideTest(filePath)
    ) {
      failures.push(
        `${relativePath}: expected a side-by-side test file for this frontend domain runtime, infrastructure runtime, or presentation component.`,
      );
    }

    if (!symbol) {
      continue;
    }

    const expectedBaseName = toKebabCase(symbol);
    const actualBaseName = normalizeBaseName(getBaseNameWithoutExtension(filePath));
    if (actualBaseName !== expectedBaseName) {
      failures.push(
        `${relativePath}: expected file name ${expectedBaseName}${path.extname(filePath)} for ${symbol}`,
      );
    }
  }

  if (failures.length === 0) {
    console.log(project.successMessage);
    return;
  }

  console.error(project.failureMessage);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  runProject(process.argv[2]);
}