import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const frontendRoot = path.resolve(import.meta.dirname, '..');
const sourceRoot = path.join(frontendRoot, 'src');
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const localImportPattern = /^(?:\.|src\/)/;
const serviceLikeNamePattern =
  /(Service|Facade|Repository|Runtime|Adapter|Gateway|Client|Registry|Reader|Renderer|Inspector|UseCase|Factory)$/;

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(absolutePath, files);
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function shouldCheckFile(filePath) {
  const relativePath = toPosix(path.relative(sourceRoot, filePath));

  if (relativePath.startsWith('app/')) {
    return false;
  }

  if (relativePath.startsWith('test-utils/')) {
    return false;
  }

  if (relativePath.includes('/generated/')) {
    return false;
  }

  return !/\.(test|spec)\.[jt]sx?$/.test(relativePath);
}

function getScriptKind(filePath) {
  switch (path.extname(filePath)) {
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.js':
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TS;
  }
}

function collectProjectClassNames(sourceFile) {
  const names = new Set();

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const importPath = statement.moduleSpecifier.getText(sourceFile).slice(1, -1);

      if (!localImportPattern.test(importPath)) {
        continue;
      }

      const importClause = statement.importClause;

      if (!importClause) {
        continue;
      }

      if (importClause.name && serviceLikeNamePattern.test(importClause.name.text)) {
        names.add(importClause.name.text);
      }

      if (
        importClause.namedBindings &&
        ts.isNamedImports(importClause.namedBindings)
      ) {
        for (const element of importClause.namedBindings.elements) {
          const importedName = element.name.text;

          if (serviceLikeNamePattern.test(importedName)) {
            names.add(importedName);
          }
        }
      }

      continue;
    }

    if (ts.isClassDeclaration(statement) && statement.name) {
      const className = statement.name.text;

      if (serviceLikeNamePattern.test(className)) {
        names.add(className);
      }
    }
  }

  return names;
}

function collectViolations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );
  const projectClassNames = collectProjectClassNames(sourceFile);
  const violations = [];

  function visit(node) {
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) {
      const className = node.expression.text;

      if (projectClassNames.has(className)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push({ className, line: line + 1 });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return violations;
}

function run() {
  const violations = [];

  for (const filePath of walk(sourceRoot)) {
    if (!shouldCheckFile(filePath)) {
      continue;
    }

    for (const violation of collectViolations(filePath)) {
      violations.push({
        filePath,
        ...violation,
      });
    }
  }

  if (violations.length === 0) {
    console.log('Frontend DI instantiation guard passed.');
    return;
  }

  console.error('Frontend DI instantiation guard failed:');

  for (const violation of violations) {
    console.error(
      `- ${toPosix(path.relative(frontendRoot, violation.filePath))}:${violation.line} instantiates ${violation.className} directly. Resolve service-like classes through the dependency injection container instead of calling new outside src/app/**.`,
    );
  }

  process.exitCode = 1;
}

run();