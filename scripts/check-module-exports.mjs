import fs from "node:fs";
import {
  loadTypeScriptFromDirectory,
  resolveAppProject,
  shouldAnalyzeAppFile,
  toProjectRelative,
  walkProjectSourceFiles,
} from "./shared/ts-analysis-harness.mjs";

export function checkModuleExports(project) {
  const ts = loadTypeScriptFromDirectory(project.root);
  const violations = [];
  for (const filePath of walkProjectSourceFiles(project)) {
    if (!shouldAnalyzeAppFile(project, filePath)) continue;
    const relativePath = toProjectRelative(project, filePath);
    const isPort = /\/ports\//.test(relativePath);
    const isBackendService =
      project.name === "backend" && /^src\/(?:domain|application)\/.*\/services\//.test(relativePath);
    if (!isPort && !isBackendService) continue;
    const source = ts.createSourceFile(filePath, fs.readFileSync(filePath, "utf8"), ts.ScriptTarget.Latest, true);
    const imports = new Set();
    const functions = new Set();
    const exported = (node) => node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    const report = (node, message) =>
      violations.push({
        filePath,
        line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
        message,
      });
    const reExportMessage =
      "Import contracts from their defining module; ports must not re-export imported declarations.";
    const serviceMessage = "Expose backend runtime services as injected classes, not standalone functions.";
    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement)) {
        const clause = statement.importClause;
        if (clause?.name) imports.add(clause.name.text);
        if (clause?.namedBindings) {
          if (ts.isNamespaceImport(clause.namedBindings)) imports.add(clause.namedBindings.name.text);
          else for (const binding of clause.namedBindings.elements) imports.add(binding.name.text);
        }
      }
      if (ts.isFunctionDeclaration(statement)) {
        if (statement.name) functions.add(statement.name.text);
        if (isBackendService && exported(statement)) report(statement, serviceMessage);
      }
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (
            declaration.initializer &&
            (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer))
          ) {
            if (ts.isIdentifier(declaration.name)) functions.add(declaration.name.text);
            if (isBackendService && exported(statement)) report(statement, serviceMessage);
          }
        }
      }
    }
    for (const statement of source.statements) {
      if (ts.isExportDeclaration(statement)) {
        if (statement.moduleSpecifier) {
          if (isPort) report(statement, reExportMessage);
          continue;
        }
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
          for (const binding of statement.exportClause.elements) {
            const name = (binding.propertyName ?? binding.name).text;
            if (isPort && imports.has(name)) report(binding, reExportMessage);
            if (isBackendService && functions.has(name)) report(binding, serviceMessage);
          }
        }
      }
      if (ts.isExportAssignment(statement)) {
        const expression = statement.expression;
        if (isPort && ts.isIdentifier(expression) && imports.has(expression.text)) report(statement, reExportMessage);
        if (
          isBackendService &&
          (ts.isArrowFunction(expression) ||
            ts.isFunctionExpression(expression) ||
            (ts.isIdentifier(expression) && functions.has(expression.text)))
        )
          report(statement, serviceMessage);
      }
    }
  }
  return violations;
}

export function runProject(projectName) {
  const project = resolveAppProject(projectName, { name: projectName });
  const violations = checkModuleExports(project);
  if (violations.length === 0) {
    console.log(`${project.label} module export guard passed.`);
    return;
  }
  for (const violation of violations) {
    console.error(`${toProjectRelative(project, violation.filePath)}:${violation.line} ${violation.message}`);
  }
  process.exitCode = 1;
}
