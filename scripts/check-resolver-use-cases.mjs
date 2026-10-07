import {
  loadTsConfigProgram,
  loadTypeScriptFromDirectory,
  resolveAppProject,
  toProjectRelative,
} from "./shared/ts-analysis-harness.mjs";

function checkResolverUseCases(project) {
  const ts = loadTypeScriptFromDirectory(project.root);
  const program = loadTsConfigProgram(ts, project.root);
  const checker = program.getTypeChecker();
  const violations = new Map();

  function symbolAt(node) {
    const symbol = checker.getSymbolAtLocation(node);
    return symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  }

  function decoratorNames(node) {
    return (ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : []).map((decorator) => {
      const expression = ts.isCallExpression(decorator.expression)
        ? decorator.expression.expression
        : decorator.expression;
      const reference = ts.isPropertyAccessExpression(expression) ? expression.name : expression;
      return symbolAt(reference)?.getName() ?? reference.getText();
    });
  }

  function report(node, message) {
    const source = node.getSourceFile();
    const file = toProjectRelative(project, source.fileName);
    const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const key = `${file}:${line}:${message}`;
    violations.set(key, { file, line, message });
  }

  function isUseCaseDeclaration(declaration) {
    const file = toProjectRelative(project, declaration.getSourceFile().fileName);
    return file.startsWith("src/application/") && file.includes("/use-cases/");
  }

  function forbiddenOrigin(declaration) {
    const file = toProjectRelative(project, declaration.getSourceFile().fileName);
    if (file.includes("node_modules/")) return /\/(?:@prisma|prisma)\//.test(file);
    if (file.startsWith("src/infrastructure/") || file.startsWith("src/app/")) return true;
    if (file.startsWith("src/domain/") && /\/(?:ports|services)\//.test(file)) return true;
    if (!file.startsWith("src/application/")) return false;
    if (isUseCaseDeclaration(declaration) || /\/dto\//.test(file)) return false;
    return !/(?:\/identifiers\/|-(?:identifier|parser)\.[cm]?[jt]s$)/.test(file);
  }

  function callsUseCase(method, seen = new Set()) {
    if (seen.has(method)) return false;
    seen.add(method);
    let found = false;
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const declaration = checker.getResolvedSignature(node)?.declaration;
        if (declaration && ts.isMethodDeclaration(declaration)) {
          if (declaration.name.getText() === "execute" && isUseCaseDeclaration(declaration)) found = true;
          else if (declaration.parent === method.parent && callsUseCase(declaration, seen)) found = true;
        }
      }
      if (!found) ts.forEachChild(node, visit);
    }
    if (method.body) visit(method.body);
    return found;
  }

  for (const source of program.getSourceFiles()) {
    const file = toProjectRelative(project, source.fileName);
    if (!file.startsWith("src/presentation/") || /\.(?:spec|test)\.[cm]?[jt]sx?$/.test(file)) continue;
    function visit(node) {
      if (ts.isClassDeclaration(node) && decoratorNames(node).includes("Resolver")) {
        function checkDependency(child) {
          if (ts.isIdentifier(child)) {
            const symbol = symbolAt(child);
            if (symbol?.declarations?.some(forbiddenOrigin)) {
              report(
                child,
                `GraphQL resolvers must call use cases instead of ${symbol.getName()}. Only identifier parsers and presentation helpers may bypass a use case.`,
              );
            }
          }
          if (ts.isCallExpression(child)) {
            const declaration = checker.getResolvedSignature(child)?.declaration;
            if (
              declaration &&
              ts.isMethodDeclaration(declaration) &&
              isUseCaseDeclaration(declaration) &&
              declaration.name.getText() !== "execute"
            ) {
              report(child, "GraphQL resolvers must call the use-case execute() entry point.");
            }
          }
          ts.forEachChild(child, checkDependency);
        }
        checkDependency(node);
        for (const member of node.members) {
          if (!ts.isMethodDeclaration(member)) continue;
          if (
            decoratorNames(member).some((name) => ["Query", "Mutation", "Subscription"].includes(name)) &&
            !callsUseCase(member)
          ) {
            report(
              member.name,
              "GraphQL operations must delegate application behavior to a use-case execute() method.",
            );
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return [...violations.values()];
}

function runProject() {
  const project = resolveAppProject("backend");
  const violations = checkResolverUseCases(project);
  if (violations.length === 0) {
    console.log("Backend GraphQL resolver use-case checks passed.");
    return;
  }
  console.error("Backend GraphQL resolver use-case checks failed:");
  for (const { file, line, message } of violations) console.error(`- ${file}:${line} ${message}`);
  process.exitCode = 1;
}

export { checkResolverUseCases, runProject };
