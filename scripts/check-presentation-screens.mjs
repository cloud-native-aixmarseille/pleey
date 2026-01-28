import fs from 'node:fs';
import path from 'node:path';

const frontendRootCandidates = [
  path.join(path.resolve(import.meta.dirname, '..'), 'application/frontend'),
  process.cwd(),
  path.resolve(process.cwd(), '../frontend'),
  '/usr/src/app',
  '/usr/src/app/application/frontend',
];

const frontendRoot = frontendRootCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, 'src/presentation')),
);

if (!frontendRoot) {
  throw new Error('Unable to locate the frontend presentation root.');
}

const presentationRoot = path.join(frontendRoot, 'src/presentation');

const INTERACTIVE_SCREEN_MAX_LINES = 220;
const STATIC_SCREEN_MAX_LINES = 320;
const INTERACTIVE_HOOK_PATTERN =
  /\b(useState|useEffect|useLayoutEffect|useMemo|useCallback|useReducer|useTransition|useDeferredValue|useSyncExternalStore)\b/g;

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(absolutePath, files);
      continue;
    }

    if (entry.name.endsWith('-screen.tsx')) {
      files.push(absolutePath);
    }
  }

  return files;
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function toFrontendRelative(filePath) {
  return toPosix(path.relative(frontendRoot, filePath));
}

function collectComponentDirectories(directory, directories = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (!entry.isDirectory()) {
      continue;
    }

    if (entry.name === 'components') {
      directories.push(absolutePath);
    }

    collectComponentDirectories(absolutePath, directories);
  }

  return directories;
}

function isValidSharedComponentDirectory(directoryPath) {
  const relativePath = toPosix(path.relative(presentationRoot, directoryPath));
  return relativePath.includes('/screens/') || relativePath.includes('/shared/');
}

function analyzeScreen(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lineCount = content.split(/\r?\n/).length;
  const interactiveHooks = [...content.matchAll(INTERACTIVE_HOOK_PATTERN)].map((match) => match[1]);
  const isInteractive = interactiveHooks.length > 0;
  const maxLines = isInteractive ? INTERACTIVE_SCREEN_MAX_LINES : STATIC_SCREEN_MAX_LINES;

  return {
    filePath,
    lineCount,
    maxLines,
    isInteractive,
    interactiveHooks: [...new Set(interactiveHooks)],
  };
}

function formatCategory(analysis) {
  return analysis.isInteractive ? 'interactive' : 'static';
}

function run() {
  const analyses = walk(presentationRoot).map(analyzeScreen);
  const violations = analyses.filter((analysis) => analysis.lineCount > analysis.maxLines);
  const invalidComponentDirectories = collectComponentDirectories(presentationRoot).filter(
    (directoryPath) => !isValidSharedComponentDirectory(directoryPath),
  );

  if (violations.length === 0 && invalidComponentDirectories.length === 0) {
    console.log('Frontend presentation screen guard passed.');
    return;
  }

  console.error('Frontend presentation screen guard failed:');

  for (const violation of violations) {
    const hooksSummary =
      violation.interactiveHooks.length === 0
        ? 'none'
        : violation.interactiveHooks.join(', ');

    console.error(
      `- ${toFrontendRelative(violation.filePath)} is a ${formatCategory(violation)} screen with ${violation.lineCount} lines (limit: ${violation.maxLines}). Hooks: ${hooksSummary}. Extract stateful orchestration into a dedicated hook or move feature-only UI into child components.`,
    );
  }

  for (const directoryPath of invalidComponentDirectories) {
    console.error(
      `- ${toFrontendRelative(directoryPath)} is a non-shared presentation components directory. Only shared component folders may live outside screens; move feature-only files under src/presentation/<scope>/screens/<feature>/components/.`,
    );
  }

  process.exitCode = 1;
}

run();