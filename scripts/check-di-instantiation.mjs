import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const workspaceRoot = path.resolve(import.meta.dirname, '..');
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const localImportPattern = /^(?:\.|src\/)/;
const compilerOptions = {
  allowJs: true,
  jsx: null,
  moduleResolution: null,
  target: null,
};

const PROJECTS = {
  frontend: {
    rootCandidates: [
      path.join(workspaceRoot, 'application/frontend'),
      '/usr/src/app',
    ],
    sourceRootRelativePath: 'src',
    label: 'Frontend',
    shouldCheckFile(relativePath) {
      if (relativePath.startsWith('src/app/')) {
        return false;
      }

      if (relativePath.startsWith('src/test-utils/')) {
        return false;
      }

      if (relativePath.includes('/generated/')) {
        return false;
      }

      return !/\.(test|spec)\.[jt]sx?$/.test(relativePath);
    },
    isForbiddenInstantiation() {
      return true;
    },
  },
  backend: {
    rootCandidates: [
      path.join(workspaceRoot, 'application/backend'),
      '/usr/src/app',
    ],
    sourceRootRelativePath: 'src',
    label: 'Backend',
    shouldCheckFile(relativePath) {
      if (relativePath.startsWith('src/app/')) {
        return false;
      }

      if (relativePath.startsWith('src/test-utils/')) {
        return false;
      }

      if (relativePath.includes('/generated/')) {
        return false;
      }

      return !/\.(test|spec)\.[jt]sx?$/.test(relativePath);
    },
    isForbiddenInstantiation(_currentRelativePath, targetRelativePath) {
      if (targetRelativePath.includes('/entities/')) {
        return false;
      }

      if (targetRelativePath.includes('/errors/')) {
        return false;
      }

      return true;
    },
  },
};

const sourceFileCache = new Map();
const exportedClassCache = new Map();
let ts;

function resolveProjectRoot(project) {
  const root = project.rootCandidates.find((candidate) =>
    fs.existsSync(path.join(candidate, project.sourceRootRelativePath)),
  );

  if (!root) {
    throw new Error(`Unable to locate ${project.label} source root.`);
  }

  return root;
}

function ensureTypeScript(project) {
  if (ts) {
    return;
  }

  const require = createRequire(path.join(project.root, 'package.json'));
  ts = require('typescript');
  compilerOptions.jsx = ts.JsxEmit.ReactJSX;
  compilerOptions.moduleResolution = ts.ModuleResolutionKind.Bundler;
  compilerOptions.target = ts.ScriptTarget.Latest;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function toProjectRelative(project, filePath) {
  return toPosix(path.relative(project.root, filePath));
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

  function visit(node) {
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) {
      const className = node.expression.text;
      const targetPaths = projectClassReferences.get(className);

      if (targetPaths) {
        for (const targetRelativePath of targetPaths) {
          if (!project.isForbiddenInstantiation(currentRelativePath, targetRelativePath, className)) {
            return;
          }
        }

        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push({ kind: 'instantiation', className, line: line + 1 });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return violations;
}

export function runProject(projectName) {
  const projectDefinition = PROJECTS[projectName];

  if (!projectDefinition) {
    throw new Error(`Unsupported project "${projectName}".`);
  }

  const project = {
    ...projectDefinition,
    root: resolveProjectRoot(projectDefinition),
  };

  ensureTypeScript(project);

  const sourceRoot = path.join(project.root, project.sourceRootRelativePath);
  const violations = [];

  for (const filePath of walk(sourceRoot)) {
    const relativePath = toProjectRelative(project, filePath);

    if (!project.shouldCheckFile(relativePath)) {
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
    console.error(
      `- ${toProjectRelative(project, violation.filePath)}:${violation.line} instantiates ${violation.className} directly. Resolve project-local classes through dependency injection or static helpers instead of calling new outside src/app/**.`,
    );
  }

  process.exitCode = 1;
}