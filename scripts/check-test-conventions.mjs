import fs from 'node:fs';
import path from 'node:path';

import { loadTypeScriptFromDirectory, toPosix, walkFiles } from './shared/ts-analysis-harness.mjs';

const TEST_FILE_PATTERN = /(?:\.spec|\.test|\.e2e-spec)\.[cm]?[jt]sx?$/;
const INLINE_HELPER_NAME_PATTERN = /^create[A-Za-z0-9]*(?:Fixture|Mock)$/;
const LIFECYCLE_HOOK_NAMES = new Set(['beforeEach', 'afterEach']);
const TEST_CASE_NAMES = new Set(['it', 'test']);
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];
const AAA_PHASE_ORDER = ['Arrange', 'Act', 'Assert'];
const AAA_COMMENT_PHASES = new Map([
  ['Arrange', ['Arrange']],
  ['Act', ['Act']],
  ['Assert', ['Assert']],
  ['Arrange + Act', ['Arrange', 'Act']],
  ['Act + Assert', ['Act', 'Assert']],
  ['Arrange + Act + Assert', ['Arrange', 'Act', 'Assert']],
]);
const AAA_COMMENT_LABELS = [...AAA_COMMENT_PHASES.keys()].sort((left, right) => right.length - left.length);

function resolveRootDirectories(argv) {
  const providedRoots = argv.slice(2);

  if (providedRoots.length === 0) {
    return [process.cwd()];
  }

  return providedRoots.map((root) => path.resolve(root));
}

function collectTestFiles(rootDirectories) {
  return rootDirectories.flatMap((rootDirectory) => {
    if (!fs.existsSync(rootDirectory)) {
      return [];
    }

    return walkFiles(rootDirectory, { extensions: SOURCE_EXTENSIONS }).filter((filePath) => {
      return !filePath.endsWith('.d.ts') && TEST_FILE_PATTERN.test(filePath);
    });
  });
}

function getLineAndColumn(sourceFile, position) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);

  return {
    line: line + 1,
    column: character + 1,
  };
}

function toRelativePath(filePath) {
  return toPosix(path.relative(process.cwd(), filePath));
}

function getOutermostIdentifier(expression, ts) {
  let current = expression;

  while (ts.isPropertyAccessExpression(current)) {
    current = current.expression;
  }

  return ts.isIdentifier(current) ? current : null;
}

function getNodeName(node, ts) {
  if (!node.name || !ts.isIdentifier(node.name)) {
    return null;
  }

  return node.name.text;
}

function normalizeExpressionText(expression, sourceFile) {
  return expression.getText(sourceFile).replace(/\s+/g, ' ').trim();
}

function containsExpectCall(node, ts) {
  let found = false;

  function visit(current) {
    if (found) {
      return;
    }

    if (ts.isCallExpression(current) && ts.isIdentifier(current.expression) && current.expression.text === 'expect') {
      found = true;
      return;
    }

    ts.forEachChild(current, visit);
  }

  visit(node);
  return found;
}

function getLeadingCommentLabels(statement, sourceText, ts) {
  const commentRanges = ts.getLeadingCommentRanges(sourceText, statement.getFullStart()) ?? [];

  return commentRanges
    .map((commentRange) => sourceText.slice(commentRange.pos, commentRange.end))
    .map((commentText) =>
      commentText
        .replace(/^\/\//, '')
        .replace(/^\/\*/, '')
        .replace(/\*\/$/, '')
        .trim(),
    )
    .flatMap((commentText) => {
      const matchedLabel = AAA_COMMENT_LABELS.find((label) => commentText === label || commentText.startsWith(`${label} `) || commentText.startsWith(`${label} -`) || commentText.startsWith(`${label}:`));

      return matchedLabel ? [matchedLabel] : [];
    });
}

function collectAaaCommentViolations(node, ts, sourceFile, violations, relativePath) {
  if (!ts.isBlock(node.body) || node.body.statements.length === 0) {
    return;
  }

  const coveredPhases = [];

  for (const statement of node.body.statements) {
    const labels = getLeadingCommentLabels(statement, sourceFile.text, ts);

    for (const label of labels) {
      coveredPhases.push(...(AAA_COMMENT_PHASES.get(label) ?? []));
    }
  }

  const location = getLineAndColumn(sourceFile, node.body.statements[0].getStart(sourceFile));
  const expectedOrder = AAA_PHASE_ORDER.join(' -> ');

  if (coveredPhases.length === 0) {
    violations.push({
      filePath: relativePath,
      line: location.line,
      column: location.column,
      message:
        'Tests must label AAA sections with leading comments. Add // Arrange, // Act, and // Assert ' +
        '(combined forms // Arrange + Act, // Act + Assert, and // Arrange + Act + Assert are allowed).',
    });
    return;
  }

  let lastPhaseIndex = -1;
  const phaseSet = new Set();

  for (const phase of coveredPhases) {
    const phaseIndex = AAA_PHASE_ORDER.indexOf(phase);
    phaseSet.add(phase);

    if (phaseIndex < lastPhaseIndex) {
      violations.push({
        filePath: relativePath,
        line: location.line,
        column: location.column,
        message: `AAA comments must appear in order (${expectedOrder}).`,
      });
      return;
    }

    lastPhaseIndex = phaseIndex;
  }

  if (phaseSet.size !== AAA_PHASE_ORDER.length) {
    violations.push({
      filePath: relativePath,
      line: location.line,
      column: location.column,
      message:
        'AAA comments must cover Arrange, Act, and Assert. ' +
        'Use either separate labels or the allowed combined forms.',
    });
  }
}

function extractAsyncExpectationSubject(node, ts, sourceFile) {
  const candidate = ts.isAwaitExpression(node) ? node.expression : node;

  if (!ts.isCallExpression(candidate)) {
    return null;
  }

  let current = candidate.expression;
  let hasAsyncExpectationChain = false;

  while (ts.isPropertyAccessExpression(current)) {
    if (current.name.text === 'rejects' || current.name.text === 'resolves') {
      hasAsyncExpectationChain = true;
    }

    current = current.expression;
  }

  if (!hasAsyncExpectationChain || !ts.isCallExpression(current)) {
    return null;
  }

  if (!ts.isIdentifier(current.expression) || current.expression.text !== 'expect') {
    return null;
  }

  const [subject] = current.arguments;

  if (!subject) {
    return null;
  }

  return {
    subject: normalizeExpressionText(subject, sourceFile),
    position: subject.getStart(sourceFile),
  };
}

function collectViolationsForTestCallback(node, ts, sourceFile, violations, relativePath) {
  const seenAsyncExpectations = new Map();

  collectAaaCommentViolations(node, ts, sourceFile, violations, relativePath);

  function registerAsyncExpectation(expression) {
    const asyncExpectation = extractAsyncExpectationSubject(expression, ts, sourceFile);

    if (!asyncExpectation) {
      return;
    }

    const previousPosition = seenAsyncExpectations.get(asyncExpectation.subject);

    if (previousPosition !== undefined) {
      const location = getLineAndColumn(sourceFile, asyncExpectation.position);
      const firstLocation = getLineAndColumn(sourceFile, previousPosition);

      violations.push({
        filePath: relativePath,
        line: location.line,
        column: location.column,
        message:
          `Repeated async expectation on the same subject \"${asyncExpectation.subject}\". ` +
          `Assert the failure in a single expectation instead of executing the same behavior multiple times ` +
          `(first seen at ${firstLocation.line}:${firstLocation.column}).`,
      });
      return;
    }

    seenAsyncExpectations.set(asyncExpectation.subject, asyncExpectation.position);
  }

  function visitStatement(statement) {
    if (ts.isBlock(statement)) {
      for (const childStatement of statement.statements) {
        visitStatement(childStatement);
      }
      return;
    }

    if (ts.isExpressionStatement(statement)) {
      registerAsyncExpectation(statement.expression);
    }

    if (ts.isReturnStatement(statement) && statement.expression) {
      registerAsyncExpectation(statement.expression);
    }

    if (ts.isIfStatement(statement)) {
      visitStatement(statement.thenStatement);

      if (statement.elseStatement) {
        visitStatement(statement.elseStatement);
      }
    }

    if (ts.isTryStatement(statement)) {
      visitStatement(statement.tryBlock);

      if (statement.catchClause?.block) {
        visitStatement(statement.catchClause.block);
      }

      if (statement.finallyBlock) {
        visitStatement(statement.finallyBlock);
      }
    }
  }

  if (ts.isBlock(node.body)) {
    for (const statement of node.body.statements) {
      visitStatement(statement);
    }
    return;
  }

  if (node.body) {
    registerAsyncExpectation(node.body);
  }
}

function analyzeFile(filePath, ts) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const violations = [];
  const relativePath = toRelativePath(filePath);

  function report(position, message) {
    const location = getLineAndColumn(sourceFile, position);

    violations.push({
      filePath: relativePath,
      line: location.line,
      column: location.column,
      message,
    });
  }

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const outermostIdentifier = getOutermostIdentifier(node.expression, ts);

      if (outermostIdentifier && LIFECYCLE_HOOK_NAMES.has(outermostIdentifier.text)) {
        report(
          outermostIdentifier.getStart(sourceFile),
          'Lifecycle hooks in spec files hide Arrange steps. Prefer explicit local setup per test instead of beforeEach/afterEach.',
        );
      }

      if (outermostIdentifier && TEST_CASE_NAMES.has(outermostIdentifier.text)) {
        const callback = node.arguments.find((argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument));

        if (callback) {
          collectViolationsForTestCallback(callback, ts, sourceFile, violations, relativePath);
        }
      }
    }

    if (ts.isFunctionDeclaration(node)) {
      const name = getNodeName(node, ts);

      if (name && INLINE_HELPER_NAME_PATTERN.test(name)) {
        report(
          node.name.getStart(sourceFile),
          `Inline helper \"${name}\" should live in shared test-utils fixtures or mocks instead of inside a spec file.`,
        );
      }
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && INLINE_HELPER_NAME_PATTERN.test(node.name.text)) {
      report(
        node.name.getStart(sourceFile),
        `Inline helper \"${node.name.text}\" should live in shared test-utils fixtures or mocks instead of inside a spec file.`,
      );
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

function main() {
  const ts = loadTypeScriptFromDirectory(process.cwd());
  const rootDirectories = resolveRootDirectories(process.argv);
  const testFiles = collectTestFiles(rootDirectories);
  const violations = testFiles.flatMap((filePath) => analyzeFile(filePath, ts));

  if (violations.length === 0) {
    return;
  }

  console.error('Test convention violations found:\n');

  for (const violation of violations) {
    console.error(`${violation.filePath}:${violation.line}:${violation.column} ${violation.message}`);
  }

  process.exitCode = 1;
}

main();