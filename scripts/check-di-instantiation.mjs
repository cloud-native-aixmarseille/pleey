import fs from 'node:fs';
import path from 'node:path';
import {
  createTypeScriptCompilerOptions,
  loadTypeScriptFromDirectory,
  resolveAppProject,
  shouldAnalyzeAppFile,
  toProjectRelative,
  walkProjectSourceFiles,
} from './shared/ts-analysis-harness.mjs';

const localImportPattern = /^(?:\.|src\/)/;
const frontendStaticCallCheckRelativePaths = [
  'src/presentation/game/party/player/screens/',
  'src/presentation/game/party/shared/screens/',
  'src/presentation/game/types/shared/management/',
];
const PROJECT_OVERRIDES = {
  frontend: {
    isForbiddenInstantiation() {
      return true;
    },
    shouldCheckStaticCalls(currentRelativePath, targetRelativePath) {
      return frontendStaticCallCheckRelativePaths.some(
        (relativePath) =>
          currentRelativePath.startsWith(relativePath) && targetRelativePath.startsWith(relativePath),
      );
    },
  },
  backend: {
    isForbiddenInstantiation(_currentRelativePath, targetRelativePath) {
      if (targetRelativePath.includes('/entities/')) {
        return false;
      }

      if (targetRelativePath.includes('/errors/')) {
        return false;
      }

      return true;
    },
    shouldCheckStaticCalls() {
      return true;
    },
  },
};

const sourceFileCache = new Map();
const exportedClassCache = new Map();
let ts;
let compilerOptions;

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

function readSourceFile(filePath) {
  const cached = sourceFileCache.get(filePath);

  if (cached) {
    return cached;
  }

  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );

  sourceFileCache.set(filePath, sourceFile);

  return sourceFile;
}

function resolveLocalModule(project, fromFilePath, importPath) {
  const resolved = ts.resolveModuleName(importPath, fromFilePath, compilerOptions, ts.sys)
    .resolvedModule;

  if (!resolved) {
    return null;
  }

  const resolvedPath = resolved.resolvedFileName;
  const sourceRoot = path.join(project.root, project.sourceRootRelativePath);

  if (!resolvedPath.startsWith(sourceRoot)) {
    return null;
  }

  return resolvedPath;
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function hasDefaultModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword));
}

function collectExportedClasses(filePath) {
  const cached = exportedClassCache.get(filePath);

  if (cached) {
    return cached;
  }

  const sourceFile = readSourceFile(filePath);
  const localClassNames = new Set();
  const namedExports = new Set();
  let hasDefaultClassExport = false;

  for (const statement of sourceFile.statements) {
    if (ts.isClassDeclaration(statement) && statement.name) {
      localClassNames.add(statement.name.text);

      if (hasExportModifier(statement)) {
        namedExports.add(statement.name.text);
      }

      if (hasExportModifier(statement) && hasDefaultModifier(statement)) {
        hasDefaultClassExport = true;
      }

      continue;
    }

    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        const localName = element.propertyName?.text ?? element.name.text;

        if (localClassNames.has(localName)) {
          namedExports.add(element.name.text);
        }
      }
    }
  }

  const result = { namedExports, hasDefaultClassExport };
  exportedClassCache.set(filePath, result);

  return result;
}

function addProjectClassReference(projectClassReferences, localName, targetRelativePath) {
  const targetPaths = projectClassReferences.get(localName) ?? new Set();
  targetPaths.add(targetRelativePath);
  projectClassReferences.set(localName, targetPaths);
}

function collectProjectClassReferences(project, sourceFile, filePath) {
  const projectClassReferences = new Map();
  const currentRelativePath = toProjectRelative(project, filePath);

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const importPath = statement.moduleSpecifier.getText(sourceFile).slice(1, -1);

      if (!localImportPattern.test(importPath)) {
        continue;
      }

      const importClause = statement.importClause;

      if (!importClause || importClause.isTypeOnly) {
        continue;
      }

      const resolvedModulePath = resolveLocalModule(project, filePath, importPath);

      if (!resolvedModulePath) {
        continue;
      }

      const targetRelativePath = toProjectRelative(project, resolvedModulePath);
      const exportedClasses = collectExportedClasses(resolvedModulePath);

      if (importClause.name && exportedClasses.hasDefaultClassExport) {
        addProjectClassReference(projectClassReferences, importClause.name.text, targetRelativePath);
      }

      if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
        for (const element of importClause.namedBindings.elements) {
          if (element.isTypeOnly) {
            continue;
          }

          const importedName = element.propertyName?.text ?? element.name.text;

          if (exportedClasses.namedExports.has(importedName)) {
            addProjectClassReference(projectClassReferences, element.name.text, targetRelativePath);
          }
        }
      }

      continue;
    }

    if (ts.isClassDeclaration(statement) && statement.name) {
      addProjectClassReference(projectClassReferences, statement.name.text, currentRelativePath);
    }
  }

  return projectClassReferences;
}

function collectViolations(project, filePath) {
  const sourceFile = readSourceFile(filePath);
  const currentRelativePath = toProjectRelative(project, filePath);
  const projectClassReferences = collectProjectClassReferences(project, sourceFile, filePath);
  const violations = [];

  function shouldReportDirectClassUsage(className, usageKind = 'instantiation') {
    const targetPaths = projectClassReferences.get(className);

    if (!targetPaths) {
      return false;
    }

    for (const targetRelativePath of targetPaths) {
      if (
        usageKind === 'static-call' &&
        !project.shouldCheckStaticCalls(currentRelativePath, targetRelativePath, className)
      ) {
        return false;
      }

      if (!project.isForbiddenInstantiation(currentRelativePath, targetRelativePath, className)) {
        return false;
      }
    }

    return true;
  }

  function visit(node) {
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) {
      const className = node.expression.text;
      if (shouldReportDirectClassUsage(className)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push({ kind: 'instantiation', className, line: line + 1 });
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression)
    ) {
      const className = node.expression.expression.text;

      if (shouldReportDirectClassUsage(className, 'static-call')) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push({
          kind: 'static-call',
          className,
          memberName: node.expression.name.text,
          line: line + 1,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return violations;
}

export function runProject(projectName) {
  const project = resolveAppProject(projectName, PROJECT_OVERRIDES[projectName]);
  ts = loadTypeScriptFromDirectory(project.root);
  compilerOptions = createTypeScriptCompilerOptions(ts, { allowJs: true });
  const violations = [];

  for (const filePath of walkProjectSourceFiles(project)) {
    if (!shouldAnalyzeAppFile(project, filePath)) {
      continue;
    }

    for (const violation of collectViolations(project, filePath)) {
      violations.push({
        filePath,
        ...violation,
      });
    }
  }

  if (violations.length === 0) {
    console.log(`${project.label} DI instantiation guard passed.`);
    return;
  }

  console.error(`${project.label} DI instantiation guard failed:`);

  for (const violation of violations) {
    const directUsageDescription =
      violation.kind === 'static-call'
        ? `calls static ${violation.className}.${violation.memberName}(...) directly`
        : `instantiates ${violation.className} directly`;

    console.error(
      `- ${toProjectRelative(project, violation.filePath)}:${violation.line} ${directUsageDescription}. Resolve project-local classes through dependency injection outside src/app/**.`,
    );
  }

  process.exitCode = 1;
}