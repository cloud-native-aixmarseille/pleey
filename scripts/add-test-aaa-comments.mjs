import fs from 'node:fs';
import path from 'node:path';

import { loadTypeScriptFromDirectory, walkFiles } from './shared/ts-analysis-harness.mjs';

const TEST_CASE_NAMES = new Set(['it', 'test']);
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];
const TEST_FILE_PATTERN = /(?:\.spec|\.test|\.e2e-spec)\.[cm]?[jt]sx?$/;
const AAA_COMMENT_PHASES = new Set([
  'Arrange',
  'Act',
  'Assert',
  'Arrange + Act',
  'Act + Assert',
  'Arrange + Act + Assert',
]);
const AAA_COMMENT_LABELS = [...AAA_COMMENT_PHASES].sort((left, right) => right.length - left.length);

function resolveRootDirectories(argv) {
  const providedRoots = argv.slice(2);

  if (providedRoots.length === 0) {
    return [path.resolve(process.cwd(), 'application')];
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

function getOutermostIdentifier(expression, ts) {
  let current = expression;

  while (ts.isPropertyAccessExpression(current)) {
    current = current.expression;
  }

  return ts.isIdentifier(current) ? current : null;
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

function isCombinedActAssertStatement(statement, sourceFile) {
  const statementText = statement.getText(sourceFile).replace(/\s+/g, ' ').trim();

  return (
    statementText.startsWith('await expect(') ||
    statementText.startsWith('expect(() =>') ||
    statementText.startsWith('expect(( ) =>')
  );
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

function getLineStart(sourceText, position) {
  return sourceText.lastIndexOf('\n', position - 1) + 1;
}

function getIndentation(sourceText, position) {
  const lineStart = getLineStart(sourceText, position);
  const linePrefix = sourceText.slice(lineStart, position);
  const indentationMatch = linePrefix.match(/^\s*/);

  return indentationMatch?.[0] ?? '';
}

function buildDesiredPhaseComments(statements, sourceFile, ts) {
  if (statements.length === 0) {
    return [];
  }

  const firstAssertionIndex = statements.findIndex((statement) => containsExpectCall(statement, ts));

  if (firstAssertionIndex === -1) {
    return [];
  }

  const preAssertionCount = firstAssertionIndex;
  const firstAssertionStatement = statements[firstAssertionIndex];

  if (preAssertionCount === 0) {
    return [{ index: firstAssertionIndex, label: 'Arrange + Act + Assert' }];
  }

  if (isCombinedActAssertStatement(firstAssertionStatement, sourceFile)) {
    return [
      { index: 0, label: 'Arrange' },
      { index: firstAssertionIndex, label: 'Act + Assert' },
    ];
  }

  if (preAssertionCount === 1) {
    return [
      { index: 0, label: 'Arrange + Act' },
      { index: firstAssertionIndex, label: 'Assert' },
    ];
  }

  return [
    { index: 0, label: 'Arrange' },
    { index: firstAssertionIndex - 1, label: 'Act' },
    { index: firstAssertionIndex, label: 'Assert' },
  ];
}

function buildInsertions(filePath, ts) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const insertions = [];

  function visit(node) {
    if (!ts.isCallExpression(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    const outermostIdentifier = getOutermostIdentifier(node.expression, ts);

    if (!outermostIdentifier || !TEST_CASE_NAMES.has(outermostIdentifier.text)) {
      ts.forEachChild(node, visit);
      return;
    }

    const callback = node.arguments.find((argument) => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument));

    if (!callback || !ts.isBlock(callback.body) || callback.body.statements.length === 0) {
      ts.forEachChild(node, visit);
      return;
    }

    const statements = [...callback.body.statements];
    const hasExistingAaaLabels = statements.some((statement) => getLeadingCommentLabels(statement, sourceText, ts).length > 0);

    if (hasExistingAaaLabels) {
      ts.forEachChild(node, visit);
      return;
    }

    const desiredComments = buildDesiredPhaseComments(statements, sourceFile, ts);

    for (const desiredComment of desiredComments) {
      const statement = statements[desiredComment.index];
      const statementStart = statement.getStart(sourceFile);
      const lineStart = getLineStart(sourceText, statementStart);
      const indentation = getIndentation(sourceText, statementStart);

      insertions.push({
        position: lineStart,
        text: `${indentation}// ${desiredComment.label}\n`,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { insertions, sourceText };
}

function applyInsertions(sourceText, insertions) {
  return [...insertions]
    .sort((left, right) => right.position - left.position)
    .reduce((updatedText, insertion) => {
      return updatedText.slice(0, insertion.position) + insertion.text + updatedText.slice(insertion.position);
    }, sourceText);
}

function main() {
  const ts = loadTypeScriptFromDirectory(process.cwd());
  const rootDirectories = resolveRootDirectories(process.argv);
  const testFiles = collectTestFiles(rootDirectories);
  let updatedFileCount = 0;

  for (const filePath of testFiles) {
    const { insertions, sourceText } = buildInsertions(filePath, ts);

    if (insertions.length === 0) {
      continue;
    }

    fs.writeFileSync(filePath, applyInsertions(sourceText, insertions));
    updatedFileCount += 1;
  }

  console.log(`Added AAA comments to ${updatedFileCount} test file(s).`);
}

main();