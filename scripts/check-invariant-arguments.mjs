import {
  loadTsConfigProgram,
  loadTypeScriptFromDirectory,
  resolveAppProject,
  shouldAnalyzeAppFile,
  toProjectRelative,
} from './shared/ts-analysis-harness.mjs';

const MIN_USAGE_COUNT = 2;

let ts;

function resolveSymbol(checker, node) {
  const symbol = checker.getSymbolAtLocation(node);

  if (!symbol) {
    return null;
  }

  if (symbol.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(symbol);
  }

  return symbol;
}

function unwrapExpression(node) {
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    return unwrapExpression(node.expression);
  }

  return node;
}

function getCallableReferenceNode(expression) {
  const unwrappedExpression = unwrapExpression(expression);

  if (ts.isIdentifier(unwrappedExpression) || ts.isPrivateIdentifier(unwrappedExpression)) {
    return unwrappedExpression;
  }

  if (ts.isPropertyAccessExpression(unwrappedExpression)) {
    return unwrappedExpression.name;
  }

  return null;
}

function getJsxReferenceNode(tagName) {
  if (ts.isIdentifier(tagName)) {
    return tagName;
  }

  if (ts.isPropertyAccessExpression(tagName)) {
    return tagName.name;
  }

  return null;
}

function getDeclarationNameNode(node) {
  if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isVariableDeclaration(node)) {
    return ts.isIdentifier(node.name) ? node.name : null;
  }

  if (ts.isMethodDeclaration(node)) {
    return ts.isIdentifier(node.name) || ts.isPrivateIdentifier(node.name) ? node.name : null;
  }

  return null;
}

function getCandidateParameters(node) {
  return node.parameters.map((parameter, index) => ({
    index,
    name: ts.isIdentifier(parameter.name) ? parameter.name.text : `parameter ${index + 1}`,
    eligible: !parameter.dotDotDotToken,
  }));
}

function isLikelyComponentName(name) {
  return /^[A-Z]/.test(name);
}

function isDefinitionName(node) {
  const parent = node.parent;

  if (!parent) {
    return false;
  }

  if (
    (ts.isFunctionDeclaration(parent) ||
      ts.isClassDeclaration(parent) ||
      ts.isVariableDeclaration(parent) ||
      ts.isMethodDeclaration(parent)) &&
    parent.name === node
  ) {
    return true;
  }

  return false;
}

function isImportOrExportName(node) {
  const parent = node.parent;

  return Boolean(
    parent &&
      (ts.isImportClause(parent) ||
        ts.isImportSpecifier(parent) ||
        ts.isNamespaceImport(parent) ||
        ts.isImportEqualsDeclaration(parent) ||
        ts.isExportSpecifier(parent)),
  );
}

function isTypeOnlyReference(node) {
  let currentNode = node;

  while (currentNode.parent) {
    currentNode = currentNode.parent;

    if (
      ts.isTypeNode(currentNode) ||
      ts.isExpressionWithTypeArguments(currentNode) ||
      ts.isHeritageClause(currentNode)
    ) {
      return true;
    }

    if (ts.isSourceFile(currentNode) || ts.isStatement(currentNode)) {
      return false;
    }
  }

  return false;
}

function isAllowedCallReference(node) {
  const parent = node.parent;

  if (!parent) {
    return false;
  }

  if (ts.isCallExpression(parent) && getCallableReferenceNode(parent.expression) === node) {
    return true;
  }

  return Boolean(
    ts.isPropertyAccessExpression(parent) &&
      parent.name === node &&
      ts.isCallExpression(parent.parent) &&
      getCallableReferenceNode(parent.parent.expression) === parent.name,
  );
}

function isAllowedJsxReference(node) {
  const parent = node.parent;

  if (!parent) {
    return false;
  }

  if (
    (ts.isJsxOpeningElement(parent) || ts.isJsxSelfClosingElement(parent)) &&
    getJsxReferenceNode(parent.tagName) === node
  ) {
    return true;
  }

  return Boolean(
    ts.isPropertyAccessExpression(parent) &&
      parent.name === node &&
      (ts.isJsxOpeningElement(parent.parent) || ts.isJsxSelfClosingElement(parent.parent)) &&
      getJsxReferenceNode(parent.parent.tagName) === parent.name
  );
}

function normalizeExpressionValue(expression, sourceFile) {
  return expression.getText(sourceFile).replace(/\s+/g, ' ').trim();
}

function isModuleScopedDeclaration(declaration) {
  let currentNode = declaration;

  while (currentNode.parent) {
    currentNode = currentNode.parent;

    if (ts.isSourceFile(currentNode)) {
      return true;
    }

    if (ts.isFunctionLike(currentNode) || ts.isBlock(currentNode)) {
      return false;
    }
  }

  return false;
}

function isInvariantExpression(checker, expression) {
  let invariant = true;

  function visit(node) {
    if (!invariant) {
      return;
    }

    if (ts.isIdentifier(node)) {
      if (
        ts.isPropertyAccessExpression(node.parent) &&
        node.parent.name === node
      ) {
        return;
      }

      const symbol = resolveSymbol(checker, node);
      const declaration = symbol?.valueDeclaration ?? symbol?.declarations?.[0] ?? null;

      if (!declaration) {
        invariant = false;
        return;
      }

      if (
        ts.isImportClause(declaration) ||
        ts.isImportSpecifier(declaration) ||
        ts.isNamespaceImport(declaration) ||
        ts.isImportEqualsDeclaration(declaration)
      ) {
        return;
      }

      if (
        (ts.isFunctionDeclaration(declaration) ||
          ts.isClassDeclaration(declaration) ||
          ts.isEnumDeclaration(declaration)) &&
        isModuleScopedDeclaration(declaration)
      ) {
        return;
      }

      if (ts.isEnumMember(declaration) && isModuleScopedDeclaration(declaration)) {
        return;
      }

      if (ts.isVariableDeclaration(declaration) && isModuleScopedDeclaration(declaration)) {
        return;
      }

      invariant = false;
      return;
    }

    if (node.kind === ts.SyntaxKind.ThisKeyword) {
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(expression);

  return invariant;
}

function normalizeJsxAttributeValue(attribute, sourceFile) {
  if (!attribute.initializer) {
    return 'true';
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return JSON.stringify(attribute.initializer.text);
  }

  if (!ts.isJsxExpression(attribute.initializer)) {
    return null;
  }

  if (!attribute.initializer.expression) {
    return null;
  }

  return normalizeExpressionValue(attribute.initializer.expression, sourceFile);
}

function createCandidate(symbol, nameNode, declarationNode, project) {
  const sourceFile = declarationNode.getSourceFile();
  const { line } = sourceFile.getLineAndCharacterOfPosition(nameNode.getStart(sourceFile));
  const parameters = getCandidateParameters(declarationNode);

  return {
    symbol,
    name: nameNode.text,
    declarationNode,
    declarationFilePath: toProjectRelative(project, sourceFile.fileName),
    declarationLine: line + 1,
    parameters,
    callOpaque: false,
    propsOpaque: false,
    callUsageCount: 0,
    paramStates: parameters.map((parameter) => ({
      ...parameter,
      allExplicit: true,
      consistent: true,
      value: null,
    })),
    jsxUsageCount: 0,
    propStates: new Map(),
    isLikelyComponent: isLikelyComponentName(nameNode.text),
  };
}

function collectCandidates(program, checker, project) {
  const candidates = new Map();

  for (const sourceFile of program.getSourceFiles()) {
    if (!shouldAnalyzeAppFile(project, sourceFile.fileName)) {
      continue;
    }

    function visit(node) {
      if (
        ts.isFunctionDeclaration(node) &&
        node.body &&
        node.name &&
        !node.asteriskToken
      ) {
        const symbol = resolveSymbol(checker, node.name);
        if (symbol) {
          candidates.set(symbol, createCandidate(symbol, node.name, node, project));
        }
      }

      if (
        ts.isMethodDeclaration(node) &&
        node.body &&
        !node.asteriskToken &&
        !node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.OverrideKeyword)
      ) {
        const nameNode = getDeclarationNameNode(node);
        const symbol = nameNode ? resolveSymbol(checker, nameNode) : null;
        if (symbol && nameNode) {
          candidates.set(symbol, createCandidate(symbol, nameNode, node, project));
        }
      }

      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        const initializer = unwrapExpression(node.initializer);
        if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
          const symbol = resolveSymbol(checker, node.name);
          if (symbol) {
            candidates.set(symbol, createCandidate(symbol, node.name, initializer, project));
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return candidates;
}

function recordCallUsage(checker, candidate, callExpression) {
  candidate.callUsageCount += 1;

  if (callExpression.arguments.some((argument) => ts.isSpreadElement(argument))) {
    candidate.callOpaque = true;
    return;
  }

  for (const state of candidate.paramStates) {
    if (!state.eligible) {
      continue;
    }

    const argument = callExpression.arguments[state.index];

    if (!argument) {
      state.allExplicit = false;
      continue;
    }

    if (!isInvariantExpression(checker, argument)) {
      state.consistent = false;
      continue;
    }

    const normalizedValue = normalizeExpressionValue(argument, callExpression.getSourceFile());

    if (state.value === null) {
      state.value = normalizedValue;
      continue;
    }

    if (state.value !== normalizedValue) {
      state.consistent = false;
    }
  }
}

function recordJsxUsage(checker, candidate, jsxElement) {
  const attributes = jsxElement.attributes.properties;
  candidate.jsxUsageCount += 1;

  if (attributes.some((attribute) => ts.isJsxSpreadAttribute(attribute))) {
    candidate.propsOpaque = true;
    return;
  }

  const seenPropNames = new Set();

  for (const attribute of attributes) {
    if (!ts.isJsxAttribute(attribute)) {
      continue;
    }

    const propName = attribute.name.text;
    const initializerExpression =
      !attribute.initializer || ts.isStringLiteral(attribute.initializer)
        ? null
        : ts.isJsxExpression(attribute.initializer)
          ? attribute.initializer.expression
          : null;
    const normalizedValue = normalizeJsxAttributeValue(attribute, jsxElement.getSourceFile());

    if (normalizedValue === null) {
      candidate.propsOpaque = true;
      return;
    }

    if (initializerExpression && !isInvariantExpression(checker, initializerExpression)) {
      const state = candidate.propStates.get(propName) ?? {
        count: 0,
        consistent: true,
        value: null,
      };

      state.count += 1;
      state.consistent = false;
      candidate.propStates.set(propName, state);
      seenPropNames.add(propName);
      continue;
    }

    const state = candidate.propStates.get(propName) ?? {
      count: 0,
      consistent: true,
      value: null,
    };

    state.count += 1;
    seenPropNames.add(propName);

    if (state.value === null) {
      state.value = normalizedValue;
    } else if (state.value !== normalizedValue) {
      state.consistent = false;
    }

    candidate.propStates.set(propName, state);
  }
}

function markOpaqueReference(candidate, node) {
  if (candidate.isLikelyComponent && isAllowedJsxReference(node)) {
    return;
  }

  if (isAllowedCallReference(node)) {
    return;
  }

  if (isDefinitionName(node) || isImportOrExportName(node) || isTypeOnlyReference(node)) {
    return;
  }

  candidate.callOpaque = true;
  candidate.propsOpaque = true;
}

function collectUsages(program, checker, project, candidates) {
  for (const sourceFile of program.getSourceFiles()) {
    if (!shouldAnalyzeAppFile(project, sourceFile.fileName)) {
      continue;
    }

    function visit(node) {
      if (ts.isCallExpression(node)) {
        const referenceNode = getCallableReferenceNode(node.expression);
        const symbol = referenceNode ? resolveSymbol(checker, referenceNode) : null;
        const candidate = symbol ? candidates.get(symbol) : null;

        if (candidate) {
          recordCallUsage(checker, candidate, node);
        }
      }

      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const referenceNode = getJsxReferenceNode(node.tagName);
        const symbol = referenceNode ? resolveSymbol(checker, referenceNode) : null;
        const candidate = symbol ? candidates.get(symbol) : null;

        if (candidate) {
          recordJsxUsage(checker, candidate, node);
        }
      }

      if (ts.isIdentifier(node) || ts.isPrivateIdentifier(node)) {
        const symbol = resolveSymbol(checker, node);
        const candidate = symbol ? candidates.get(symbol) : null;

        if (candidate) {
          markOpaqueReference(candidate, node);
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }
}

function collectViolations(candidates) {
  const violations = [];

  for (const candidate of candidates.values()) {
    if (!candidate.callOpaque && candidate.callUsageCount >= MIN_USAGE_COUNT) {
      for (const state of candidate.paramStates) {
        if (!state.eligible || !state.allExplicit || !state.consistent || state.value === null) {
          continue;
        }

        violations.push({
          kind: 'argument',
          declarationFilePath: candidate.declarationFilePath,
          declarationLine: candidate.declarationLine,
          symbolName: candidate.name,
          memberName: state.name,
          usageCount: candidate.callUsageCount,
          value: state.value,
        });
      }
    }

    if (!candidate.propsOpaque && candidate.isLikelyComponent && candidate.jsxUsageCount >= MIN_USAGE_COUNT) {
      for (const [propName, state] of candidate.propStates) {
        if (state.count !== candidate.jsxUsageCount || !state.consistent || state.value === null) {
          continue;
        }

        violations.push({
          kind: 'prop',
          declarationFilePath: candidate.declarationFilePath,
          declarationLine: candidate.declarationLine,
          symbolName: candidate.name,
          memberName: propName,
          usageCount: candidate.jsxUsageCount,
          value: state.value,
        });
      }
    }
  }

  return violations.sort((left, right) => {
    const fileComparison = left.declarationFilePath.localeCompare(right.declarationFilePath);
    if (fileComparison !== 0) {
      return fileComparison;
    }

    if (left.declarationLine !== right.declarationLine) {
      return left.declarationLine - right.declarationLine;
    }

    return left.memberName.localeCompare(right.memberName);
  });
}

function formatViolation(violation) {
  if (violation.kind === 'argument') {
    return `- ${violation.declarationFilePath}:${violation.declarationLine} ${violation.symbolName} parameter "${violation.memberName}" is always called with ${violation.value} across ${violation.usageCount} call sites. Remove the parameter or inline the invariant.`;
  }

  return `- ${violation.declarationFilePath}:${violation.declarationLine} ${violation.symbolName} prop "${violation.memberName}" is always passed as ${violation.value} across ${violation.usageCount} JSX usages. Remove the prop or inline the invariant inside the component.`;
}

function runProject(projectName) {
  const project = resolveAppProject(projectName);
  ts = loadTypeScriptFromDirectory(project.root);
  const program = loadTsConfigProgram(ts, project.root, { compilerOptions: { noEmit: true } });
  const checker = program.getTypeChecker();
  const candidates = collectCandidates(program, checker, project);
  collectUsages(program, checker, project, candidates);
  const violations = collectViolations(candidates);

  if (violations.length === 0) {
    console.log(`${project.label} invariant argument checks passed.`);
    return;
  }

  console.error(`${project.label} invariant argument checks failed:`);
  for (const violation of violations) {
    console.error(formatViolation(violation));
  }
  process.exitCode = 1;
}

export { runProject };