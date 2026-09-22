import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  loadTsConfigProgram,
  loadTypeScriptFromDirectory,
  resolveAppProject,
  toProjectRelative,
  walkFiles,
} from "./shared/ts-analysis-harness.mjs";

const metadata = ["totalCount", "overallCount", "page", "pageSize", "totalPages"];
// ADR 0011: complete internal aggregate reads, never public collection endpoints.
const completeReads = new Map([
  ["PrismaOrganizationRepository.findByIds", "Hydrates organization IDs from one bounded membership page."],
  [
    "PrismaPartyManagementAdapter.findActivePartiesByHostId",
    "Checks all conflicting active sessions before a host action.",
  ],
  [
    "PrismaQuizQuestionRepository.normalizeQuestionPositions",
    "Repairs the complete ordered aggregate before a mutation.",
  ],
  [
    "PrismaQuizQuestionRepository.shiftQuestionsForInsert",
    "Moves every affected position inside a mutation transaction.",
  ],
  ["PrismaQuizQuestionRepository.shiftQuestionsDown", "Moves every affected position inside a mutation transaction."],
  ["PrismaQuizQuestionRepository.shiftQuestionsUp", "Moves every affected position inside a mutation transaction."],
  ["QuizPartyStageCatalogEntryResolver.listStages", "Builds the complete runtime stage catalog for one game."],
  ["PredictionPartyStageCatalogEntryResolver.listStages", "Builds the complete runtime stage catalog for one game."],
  ["PrismaHostPartyRuntimeControlAdapter.resetPlayerProgress", "Resets all players in a party as one runtime command."],
  [
    "PrismaPlayerPartyRuntimeAdapter.findPartyPlayer",
    "Reconciles duplicate identities and computes complete party standings.",
  ],
]);

export function checkBackendPagination(projectRoot, exceptions = completeReads) {
  const ts = loadTypeScriptFromDirectory(projectRoot);
  const program = loadTsConfigProgram(ts, projectRoot);
  const checker = program.getTypeChecker();
  const failures = [];
  const usedExceptions = new Set();
  const report = (node, message) =>
    failures.push(
      `${path.relative(projectRoot, node.getSourceFile().fileName)}:${node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1}: ${message}`,
    );
  const isArray = (type) =>
    checker.isArrayType(type) ||
    checker.isTupleType(type) ||
    (checker.typeToString(type).startsWith("readonly ") && checker.typeToString(type).endsWith("[]"));
  const properties = (type) => checker.getPropertiesOfType(checker.getNonNullableType(type));
  const symbolName = (node) => {
    const symbol = node && checker.getSymbolAtLocation(node);
    return symbol && (symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol).getName();
  };
  const nameOf = (node) => node?.name?.getText().replaceAll("'", "").replaceAll('"', "");
  const initializer = (node) => {
    if (!node) return undefined;
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node))
      return initializer(node.expression);
    if (ts.isIdentifier(node)) {
      const declaration = checker.getSymbolAtLocation(node)?.valueDeclaration;
      if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer !== node)
        return initializer(declaration.initializer);
    }
    return node;
  };
  const property = (node, name) => {
    node = initializer(node);
    if (!node || !ts.isObjectLiteralExpression(node)) return undefined;
    for (const member of node.properties) {
      if (nameOf(member) === name) {
        if (ts.isShorthandPropertyAssignment(member))
          return initializer(checker.getShorthandAssignmentValueSymbol(member)?.valueDeclaration?.initializer);
        return initializer(member.initializer);
      }
    }
  };
  const uniqueOrder = (node) => {
    node = initializer(node);
    if (!node) return false;
    if (ts.isConditionalExpression(node)) return uniqueOrder(node.whenTrue) && uniqueOrder(node.whenFalse);
    if (ts.isArrayLiteralExpression(node)) return uniqueOrder(node.elements.at(-1));
    return Boolean(property(node, "id"));
  };
  const inherits = (type, wanted, seen = new Set()) => {
    type = type && checker.getNonNullableType(type);
    if (!type || seen.has(type)) return false;
    seen.add(type);
    if (type.symbol?.name === wanted) return true;
    if (wanted === "PaginatedType") {
      for (const declaration of type.symbol?.declarations ?? []) {
        if (!ts.isClassDeclaration(declaration)) continue;
        for (const clause of declaration.heritageClauses ?? []) {
          for (const base of clause.types) {
            const expression = initializer(base.expression);
            if (expression && ts.isCallExpression(expression) && symbolName(expression.expression) === "Paginated")
              return true;
          }
        }
      }
    }
    return (type.getBaseTypes?.() ?? []).some((base) => inherits(base, wanted, seen));
  };
  for (const source of program.getSourceFiles()) {
    if (
      !source.fileName.startsWith(path.join(projectRoot, "src")) ||
      /(?:\.spec\.ts|\/generated\/|\/test-utils\/)/.test(source.fileName)
    )
      continue;
    const visit = (node) => {
      if (ts.isMethodDeclaration(node)) {
        const decorators = ts.getDecorators(node) ?? [];
        const query = decorators.find(
          (d) => ts.isCallExpression(d.expression) && symbolName(d.expression.expression) === "Query",
        );
        if (query) {
          const signature = checker.getSignatureFromDeclaration(node);
          const result = checker.getAwaitedType(checker.getReturnTypeOfSignature(signature));
          const callback = query.expression.arguments[0];
          const declaredOutput =
            callback && ts.isArrowFunction(callback) ? checker.getTypeAtLocation(callback.body) : undefined;
          const output = declaredOutput?.getConstructSignatures()[0]?.getReturnType();
          const members = properties(result);
          const hasList =
            isArray(result) ||
            [...members, ...(output ? properties(output) : [])].some((p) =>
              isArray(checker.getTypeOfSymbolAtLocation(p, node)),
            );
          if (hasList) {
            if (
              isArray(result) ||
              !["items", ...metadata].every((key) => members.some((p) => p.name === key)) ||
              !inherits(output ?? result, "PaginatedType")
            )
              report(node, "List queries must return Paginated(ItemType), including all shared metadata (ADR 0011).");
            if (!node.parameters.some((p) => inherits(checker.getTypeAtLocation(p), "PaginationInput")))
              report(node, "List query input must extend PaginationInput (ADR 0011).");
          }
        }
      }
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "findMany"
      ) {
        let owner = node.parent;
        while (owner && !ts.isMethodDeclaration(owner)) owner = owner.parent;
        const key = owner ? `${owner.parent.name?.text}.${nameOf(owner)}` : "";
        if (exceptions.has(key)) usedExceptions.add(key);
        else {
          const args = node.arguments[0];
          const take = property(args, "take");
          const skip = property(args, "skip");
          const normalizer = take && ts.isPropertyAccessExpression(take) ? initializer(take.expression) : undefined;
          if (
            !take ||
            !skip ||
            !ts.isPropertyAccessExpression(take) ||
            !ts.isPropertyAccessExpression(skip) ||
            take.name.text !== "pageSize" ||
            skip.name.text !== "skip" ||
            take.expression.getText() !== skip.expression.getText() ||
            !normalizer ||
            !ts.isCallExpression(normalizer) ||
            !ts.isPropertyAccessExpression(normalizer.expression) ||
            checker.getTypeAtLocation(normalizer.expression.expression).symbol?.name !== "PaginationQueryNormalizer"
          )
            report(node, "Use a window produced by PaginationQueryNormalizer for skip and take (ADR 0011).");
          if (!property(args, "skip") || !property(args, "take") || !uniqueOrder(property(args, "orderBy")))
            report(
              node,
              "Database lists require skip, take, and ordering ending in id; complete internal reads need an exact documented exception (ADR 0011).",
            );
          let transaction = node.parent;
          while (
            transaction &&
            !(
              ts.isCallExpression(transaction) &&
              ts.isPropertyAccessExpression(transaction.expression) &&
              transaction.expression.name.text === "$transaction"
            )
          )
            transaction = transaction.parent;
          const isolation = transaction && property(transaction.arguments[1], "isolationLevel");
          if (!isolation || !ts.isStringLiteral(isolation) || isolation.text !== "RepeatableRead")
            report(node, "Read page rows and counts in a RepeatableRead transaction (ADR 0011).");
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  for (const key of exceptions.keys())
    if (!usedExceptions.has(key)) failures.push(`Stale pagination exception: ${key}`);
  return failures;
}

export function checkPaginationOperations(schemaText, documents, graphql) {
  const {
    buildSchema,
    getNamedType,
    isListType,
    isNonNullType,
    Kind,
    parse,
    TypeInfo,
    validate,
    visit,
    visitWithTypeInfo,
  } = graphql;
  const schema = buildSchema(schemaText);
  const failures = [];
  for (const [file, text] of documents) {
    const document = parse(text);
    failures.push(...validate(schema, document).map((error) => `${file}: ${error.message}`));
    const fragments = new Map(
      document.definitions.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION).map((d) => [d.name.value, d]),
    );
    const selectedNames = (set, seen = new Set()) =>
      (set?.selections ?? []).flatMap((s) => {
        if (s.kind === Kind.FIELD) return [s.name.value];
        if (s.kind === Kind.INLINE_FRAGMENT) return selectedNames(s.selectionSet, seen);
        if (seen.has(s.name.value)) return [];
        return selectedNames(fragments.get(s.name.value)?.selectionSet, new Set([...seen, s.name.value]));
      });
    const info = new TypeInfo(schema);
    visit(
      document,
      visitWithTypeInfo(info, {
        Field(node) {
          if (info.getParentType() !== schema.getQueryType()) return;
          const field = info.getFieldDef();
          if (!field) return;
          const output = isNonNullType(field.type) ? field.type.ofType : field.type;
          if (isListType(output)) failures.push(`${file}: ${node.name.value} returns an unpaginated root list.`);
          const fields = getNamedType(output).getFields?.();
          if (!fields?.items) return;
          const selected = selectedNames(node.selectionSet);
          if (!["items", ...metadata].every((key) => selected.includes(key)))
            failures.push(`${file}: ${node.name.value} must select items and all pagination metadata.`);
          if (!node.arguments?.some((arg) => arg.name.value === "input"))
            failures.push(`${file}: ${node.name.value} must pass pagination input explicitly.`);
          const input = getNamedType(field.args.find((arg) => arg.name === "input")?.type);
          if (!input?.getFields?.().page || !input?.getFields?.().pageSize)
            failures.push(`${file}: ${node.name.value} input needs page and pageSize.`);
        },
      }),
    );
  }
  return failures;
}

export function runProject(projectName) {
  const project = resolveAppProject(projectName);
  let failures;
  if (projectName === "backend") failures = checkBackendPagination(project.root);
  else {
    const require = createRequire(path.join(project.root, "package.json"));
    const schemaPath = [
      process.env.CODEGEN_SCHEMA,
      path.resolve(project.root, "../backend/src/schema.gql"),
      "/usr/src/backend/src/schema.gql",
    ]
      .filter(Boolean)
      .find((file) => fs.existsSync(file));
    if (!schemaPath) throw new Error("Pagination guard cannot locate backend schema.");
    const files = walkFiles(path.join(project.root, "src/infrastructure"), { extensions: [".graphql"] });
    failures = checkPaginationOperations(
      fs.readFileSync(schemaPath, "utf8"),
      files.map((file) => [toProjectRelative(project, file), fs.readFileSync(file, "utf8")]),
      require("graphql"),
    );
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else console.log(`${project.label} pagination contract checks passed.`);
}
