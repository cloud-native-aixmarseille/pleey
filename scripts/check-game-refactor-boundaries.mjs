import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g;

const projectConfigs = {
  backend: {
    relativeRoot: 'application/backend',
    targetPrefixes: [
      'src/domain/game/',
      'src/application/game/',
      'src/presentation/game/',
      'src/infrastructure/game/',
      'src/app/modules/game/',
      'src/app/modules/prediction/',
      'src/app/modules/quiz/',
    ],
    legacyPrefixes: [
      'src/domain/prediction/',
      'src/domain/quiz/',
      'src/application/game-session/',
      'src/application/prediction-management/',
      'src/application/quiz-management/',
      'src/presentation/game-session/',
      'src/presentation/prediction-management/',
      'src/presentation/quiz-management/',
      'src/infrastructure/prediction/',
      'src/infrastructure/quiz/',
    ],
  },
  frontend: {
    relativeRoot: 'application/frontend',
    targetPrefixes: [
      'src/domains/game/',
      'src/application/game/',
      'src/presentation/game/',
      'src/infrastructure/game/',
      'src/app/game/',
    ],
    legacyPrefixes: [
      'src/domains/game-session/',
      'src/domains/game-catalog/',
      'src/domains/prediction/',
      'src/domains/quiz/',
      'src/application/game-session/',
      'src/application/game-catalog/',
      'src/infrastructure/game-session/',
      'src/infrastructure/game-catalog/',
      'src/infrastructure/prediction/',
      'src/infrastructure/quiz/',
      'src/app/game-session/',
      'src/app/prediction-management/',
      'src/app/quiz-management/',
      'src/presentation/game-session/',
      'src/presentation/prediction/',
      'src/presentation/quiz/',
    ],
  },
};

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(absolutePath, files);
      continue;
    }

    if (sourceExtensions.includes(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function extractImportSources(content) {
  return [...content.matchAll(importPattern)].map((match) => match[1]);
}

function resolveImportPath(projectRoot, importerRelativePath, importSource) {
  if (importSource.startsWith('src/')) {
    return importSource;
  }

  if (!importSource.startsWith('.')) {
    return null;
  }

  const importerDirectory = path.dirname(path.join(projectRoot, importerRelativePath));
  const absoluteImportPath = path.resolve(importerDirectory, importSource);
  const candidatePaths = [
    absoluteImportPath,
    ...sourceExtensions.map((extension) => `${absoluteImportPath}${extension}`),
    ...sourceExtensions.map((extension) => path.join(absoluteImportPath, `index${extension}`)),
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      return toPosix(path.relative(projectRoot, candidatePath));
    }
  }

  return toPosix(path.relative(projectRoot, absoluteImportPath));
}

function formatViolation(violation) {
  return `- ${violation.filePath} imports ${violation.importSource} (${violation.resolvedPath}). ${violation.message}`;
}

function findExistingProjectRoot(projectName, config) {
  const cwd = process.cwd();
  const candidates = [
    process.env[`PLEEY_${projectName.toUpperCase()}_ROOT`],
    process.env.PLEEY_WORKSPACE_ROOT && path.join(process.env.PLEEY_WORKSPACE_ROOT, config.relativeRoot),
    path.join(workspaceRoot, config.relativeRoot),
    cwd,
    path.join(cwd, config.relativeRoot),
    '/usr/src/app',
    path.join('/usr/src', config.relativeRoot),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const sourceRoot = path.join(candidate, 'src');
    if (fs.existsSync(sourceRoot)) {
      return candidate;
    }
  }

  throw new Error(
    `Unable to locate ${projectName} project root. Checked: ${candidates.join(', ')}`,
  );
}

export function runProject(projectName) {
  const config = projectConfigs[projectName];

  if (!config) {
    throw new Error(`Unsupported project '${projectName}'. Expected one of: ${Object.keys(projectConfigs).join(', ')}.`);
  }

  const projectRoot = findExistingProjectRoot(projectName, config);
  const sourceRoot = path.join(projectRoot, 'src');
  const violations = [];

  for (const filePath of walk(sourceRoot)) {
    const relativePath = toPosix(path.relative(projectRoot, filePath));
    const isTargetFile = config.targetPrefixes.some((prefix) => relativePath.startsWith(prefix));

    if (!isTargetFile) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    for (const importSource of extractImportSources(content)) {
      if (importSource.startsWith("/")) {
        continue;
      }

      if (importSource.includes('backup/game-refactor-m0')) {
        violations.push({
          filePath: relativePath,
          importSource,
          resolvedPath: importSource,
          message: 'Active milestone-0 source must not import from the frozen backup tree.',
        });
        continue;
      }

      const resolvedPath = resolveImportPath(projectRoot, relativePath, importSource);

      if (!resolvedPath) {
        continue;
      }

      const legacyPrefix = config.legacyPrefixes.find((prefix) => resolvedPath.startsWith(prefix));
      if (legacyPrefix) {
        violations.push({
          filePath: relativePath,
          importSource,
          resolvedPath,
          message: `New milestone-0 source must not depend on legacy path ${legacyPrefix}.`,
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log(`${projectName} game refactor boundary checks passed.`);
    return;
  }

  console.error(`${projectName} game refactor boundary checks failed:`);
  for (const violation of violations) {
    console.error(formatViolation(violation));
  }
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  const projectName = process.argv[2];
  runProject(projectName);
}