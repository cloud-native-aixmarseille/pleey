import fs from "node:fs";
import path from "node:path";
import {
  loadTsConfigProgram,
  loadTypeScriptFromDirectory,
  resolveAppProject,
  toProjectRelative,
} from "./shared/ts-analysis-harness.mjs";

const TEST_FILE_PATTERN = /\.(test|spec)\.[jt]sx?$/u;

const PROJECT_FILTERS = {
  backend(relativePath) {
    if (!relativePath.startsWith("src/")) {
      return false;
    }

    if (relativePath.startsWith("src/app/")) {
      return false;
    }

    return !(
      relativePath.startsWith("src/test-utils/") ||
      relativePath.includes("/generated/") ||
      TEST_FILE_PATTERN.test(relativePath)
    );
  },
  frontend(relativePath) {
    if (!relativePath.startsWith("src/")) {
      return false;
    }

    return !(
      relativePath.startsWith("src/test-utils/") ||
      relativePath.includes("/generated/") ||
      TEST_FILE_PATTERN.test(relativePath)
    );
  },
};

const DOMAIN_ROOTS = {
  backend: "src/domain/",
  frontend: "src/domains/",
};

const ERROR_MODULE_PATTERN = /(^|\/)(errors\/.*|[^/]+(?:\.error|-error-code)\.[jt]sx?)$/u;
const ERROR_CODE_ENUM_PATTERN = /error-code\.enum\.[jt]s$/u;
const ENUM_ERROR_DIRECTORY_PATTERN = /\/enums\/errors\//u;

function getScriptKind(ts, filePath) {
  switch (path.extname(filePath)) {
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".js":
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TS;
  }
}

function createSourceFile(ts, filePath) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(ts, filePath),
  );
}

function unwrapExpression(ts, node) {
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    return unwrapExpression(ts, node.expression);
  }

  return node;
}

function hasNonEmptyContext(ts, args, index) {
  if (!args || args.length <= index) {
    return false;
  }

  if (args[index] == null) {
    return false;
  }

  const contextExpression = unwrapExpression(ts, args[index]);

  if (contextExpression.kind === ts.SyntaxKind.NullKeyword) {
    return false;
  }

  if (ts.isIdentifier(contextExpression) && contextExpression.text === "undefined") {
    return false;
  }

  if (ts.isObjectLiteralExpression(contextExpression) && contextExpression.properties.length === 0) {
    return false;
  }

  return true;
}

function getAliasedContextSymbol(ts, checker, expression) {
  const contextExpression = unwrapExpression(ts, expression);

  if (!ts.isIdentifier(contextExpression)) {
    return null;
  }

  const symbol = checker.getSymbolAtLocation(contextExpression);

  if (!symbol) {
    return null;
  }

  if (symbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(symbol);
  }

  return symbol;
}

function resolveSymbol(ts, checker, node) {
  const symbol = checker.getSymbolAtLocation(node);

  if (!symbol) {
    return null;
  }

  if (symbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(symbol);
  }

  return symbol;
}

function resolveAliasedEmptyContextReason(ts, checker, expression, seenSymbols = new Set()) {
  const symbol = getAliasedContextSymbol(ts, checker, expression);

  if (!symbol || seenSymbols.has(symbol)) {
    return null;
  }

  seenSymbols.add(symbol);

  const declaration =
    symbol.valueDeclaration ??
    symbol.declarations?.find((candidate) => ts.isVariableDeclaration(candidate)) ??
    symbol.declarations?.[0] ??
    null;

  if (!declaration || !ts.isVariableDeclaration(declaration) || !declaration.initializer) {
    return null;
  }

  const initializer = unwrapExpression(ts, declaration.initializer);

  if (initializer.kind === ts.SyntaxKind.NullKeyword) {
    return "resolves to null";
  }

  if (ts.isIdentifier(initializer) && initializer.text === "undefined") {
    return "resolves to undefined";
  }

  if (ts.isObjectLiteralExpression(initializer) && initializer.properties.length === 0) {
    return "resolves to an empty object literal";
  }

  if (ts.isIdentifier(initializer)) {
    return resolveAliasedEmptyContextReason(ts, checker, initializer, seenSymbols);
  }

  return null;
}

function getThrownContextArgument(ts, expression) {
  const unwrappedExpression = unwrapExpression(ts, expression);

  if (ts.isNewExpression(unwrappedExpression) && ts.isIdentifier(unwrappedExpression.expression)) {
    const errorName = unwrappedExpression.expression.text;

    if (errorName !== "Error" && errorName.endsWith("Error")) {
      return unwrappedExpression.arguments?.[0] ?? null;
    }
  }

  if (ts.isCallExpression(unwrappedExpression) && ts.isIdentifier(unwrappedExpression.expression)) {
    if (unwrappedExpression.expression.text === "createDomainError") {
      return unwrappedExpression.arguments?.[1] ?? null;
    }
  }

  return null;
}

function isThrownCreateDomainError(ts, expression) {
  const unwrappedExpression = unwrapExpression(ts, expression);

  return (
    ts.isCallExpression(unwrappedExpression) &&
    ts.isIdentifier(unwrappedExpression.expression) &&
    unwrappedExpression.expression.text === "createDomainError"
  );
}

function isDomainScopedPath(projectName, relativePath) {
  return relativePath.startsWith(DOMAIN_ROOTS[projectName]);
}

function isErrorModuleOutsideDomain(projectName, relativePath) {
  return !isDomainScopedPath(projectName, relativePath) && ERROR_MODULE_PATTERN.test(relativePath);
}

function hasDomainErrorModuleExports(ts, sourceFile) {
  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      if (
        statement.exportClause.elements.some((element) => {
          const exportedName = element.name.text;
          return exportedName.endsWith("Error") || exportedName.endsWith("ErrorCode");
        })
      ) {
        return true;
      }
    }

    if (ts.isEnumDeclaration(statement) && statement.name.text.endsWith("ErrorCode")) {
      return true;
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          (declaration.name.text.endsWith("ERROR_CODE") || declaration.name.text.endsWith("ERROR_DEFINITIONS"))
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

function exportedErrorClassNames(ts, sourceFile) {
  const names = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
      continue;
    }

    for (const element of statement.exportClause.elements) {
      const exportedName = element.name.text;

      if (exportedName.endsWith("Error")) {
        names.push(exportedName);
      }
    }
  }

  return names;
}

function extendsDomainError(ts, checker, classDeclaration, seenSymbols = new Set()) {
  if (!classDeclaration.name) {
    return false;
  }

  const classType = checker.getTypeAtLocation(classDeclaration.name);
  const baseTypes = classType.getBaseTypes?.() ?? [];

  for (const baseType of baseTypes) {
    const baseSymbol = baseType.getSymbol();

    if (!baseSymbol || seenSymbols.has(baseSymbol)) {
      continue;
    }

    if (baseSymbol.getName() === "DomainError") {
      return true;
    }

    seenSymbols.add(baseSymbol);
    const baseDeclaration =
      baseSymbol.valueDeclaration ??
      baseSymbol.declarations?.find((candidate) => ts.isClassDeclaration(candidate)) ??
      baseSymbol.declarations?.[0] ??
      null;

    if (baseDeclaration && ts.isClassDeclaration(baseDeclaration)) {
      if (extendsDomainError(ts, checker, baseDeclaration, seenSymbols)) {
        return true;
      }
    }
  }

  return false;
}

function collectViolationsForFile(ts, checker, sourceFile, relativePath, projectName) {
  const violations = [];

  function report(node, message) {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    violations.push({
      filePath: relativePath,
      line: line + 1,
      message,
    });
  }

  if (isErrorModuleOutsideDomain(projectName, relativePath) && hasDomainErrorModuleExports(ts, sourceFile)) {
    report(
      sourceFile,
      `Domain error modules must live under ${DOMAIN_ROOTS[projectName]}**. Move this module into the domain scope.`,
    );
  }

  if (ENUM_ERROR_DIRECTORY_PATTERN.test(relativePath)) {
    report(
      sourceFile,
      "Domain error files must not live under an enums/errors folder. Move them into a sibling errors/ folder outside enums.",
    );
  }

  if (ERROR_CODE_ENUM_PATTERN.test(relativePath)) {
    for (const exportedName of exportedErrorClassNames(ts, sourceFile)) {
      report(
        sourceFile,
        `Do not re-export ${exportedName} from an error-code enum module. Import error classes from the sibling errors/ folder instead.`,
      );
    }
  }

  function visit(node) {
    if (
      ts.isClassDeclaration(node) &&
      node.name &&
      !isDomainScopedPath(projectName, relativePath) &&
      extendsDomainError(ts, checker, node)
    ) {
      report(
        node.name,
        `Class ${node.name.text} extends DomainError outside ${DOMAIN_ROOTS[projectName]}**. Move it into the domain scope.`,
      );
    }

    if (ts.isThrowStatement(node) && node.expression) {
      const contextArgument = getThrownContextArgument(ts, node.expression);

      if (isThrownCreateDomainError(ts, node.expression) && !hasNonEmptyContext(ts, [contextArgument], 0)) {
        report(node.expression, "createDomainError(...) must include a non-empty context object when thrown.");
      }

      if (contextArgument && hasNonEmptyContext(ts, [contextArgument], 0)) {
        const reason = resolveAliasedEmptyContextReason(ts, checker, contextArgument);

        if (reason) {
          report(
            contextArgument,
            `Domain error context ${reason}. Inline a meaningful context object or resolve the alias to relevant local facts.`,
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return violations;
}

function runProject(projectName) {
  const project = resolveAppProject(projectName);
  const ts = loadTypeScriptFromDirectory(project.root);
  const program = loadTsConfigProgram(ts, project.root, { compilerOptions: { noEmit: true } });
  const checker = program.getTypeChecker();
  const shouldCheckFile = PROJECT_FILTERS[projectName];

  if (!shouldCheckFile) {
    throw new Error(`Unsupported project "${projectName}".`);
  }

  const violations = [];

  for (const sourceFile of program.getSourceFiles()) {
    const filePath = sourceFile.fileName;
    if (!filePath.startsWith(project.root)) {
      continue;
    }

    const relativePath = toProjectRelative(project, filePath);

    if (!shouldCheckFile(relativePath)) {
      continue;
    }

    violations.push(...collectViolationsForFile(ts, checker, sourceFile, relativePath, projectName));
  }

  if (violations.length === 0) {
    console.log(`${project.label} domain error checks passed.`);
    return;
  }

  console.error(`${project.label} domain error checks failed:`);

  for (const violation of violations) {
    console.error(`- ${violation.filePath}:${violation.line} ${violation.message}`);
  }

  process.exitCode = 1;
}

export { runProject };
