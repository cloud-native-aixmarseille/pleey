import fs from "node:fs";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");

const EXPECTED_EXPORT_ENTRIES = [
  ".",
  "./errors",
  "./game",
  "./identity",
  "./media",
  "./organization",
  "./package.json",
  "./party",
  "./project",
  "./shared/primitives",
  "./theme",
].sort();

const FORBIDDEN_IMPORT_RULES = [
  { matcher: "@nestjs/", reason: "NestJS runtime imports must stay application-local." },
  { matcher: "@prisma/", reason: "Prisma imports must stay infrastructure-local." },
  { matcher: "prisma", reason: "Prisma imports must stay infrastructure-local." },
  { matcher: "@apollo/", reason: "Apollo imports must stay transport-local." },
  { matcher: "react", reason: "React imports must stay frontend presentation-local." },
  { matcher: "react-dom", reason: "React DOM imports must stay frontend presentation-local." },
  { matcher: "@mantine/", reason: "Mantine imports must stay frontend presentation-local." },
  { matcher: "socket.io", reason: "Socket.IO runtime imports must stay transport-local." },
  { matcher: "socket.io-client", reason: "Socket.IO runtime imports must stay transport-local." },
  { matcher: "inversify", reason: "Composition-framework imports must stay application-local." },
  { matcher: "node:", reason: "Node runtime imports are not allowed in shared domain sources." },
];

const FRONTEND_TO_BACKEND_ENUMS = [
  "SocketIoPartyObservationEventName",
  "SocketIoPartyJoinEventName",
  "SocketIoPartyHostCommandEventName",
  "SocketIoPartyPlayerCommandEventName",
];

function fail(message) {
  throw new Error(message);
}

function resolveExistingPath(candidates, description) {
  const resolved = candidates.find((candidate) => fs.existsSync(candidate));
  if (!resolved) {
    fail(`Unable to locate ${description}. Checked: ${candidates.join(", ")}`);
  }

  return resolved;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function asSortedUnique(values) {
  return [...new Set(values)].sort();
}

function isSameSortedValues(left, right) {
  return JSON.stringify(asSortedUnique(left)) === JSON.stringify(asSortedUnique(right));
}

function resolveSharedPackageRoot() {
  return resolveExistingPath(
    [path.join(workspaceRoot, "packages/pleey-domain"), "/usr/packages/pleey-domain"],
    "shared domain package root",
  );
}

function checkPackageApiSurface(packageRoot) {
  const packageJsonPath = path.join(packageRoot, "package.json");
  const packageJson = readJson(packageJsonPath);

  if (packageJson.name !== "@pleey/domain") {
    fail(`Unexpected shared package name: ${packageJson.name}`);
  }

  const exportEntries = asSortedUnique(Object.keys(packageJson.exports ?? {}));
  if (!isSameSortedValues(exportEntries, EXPECTED_EXPORT_ENTRIES)) {
    fail(
      `Unexpected shared package exports. Expected ${EXPECTED_EXPORT_ENTRIES.join(", ")}, received ${exportEntries.join(", ")}`,
    );
  }
}

function collectPackageSourceFiles(packageRoot) {
  const roots = [path.join(packageRoot, "src"), packageRoot];
  const allowedExtensions = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);
  const files = [];

  for (const root of roots) {
    if (!fs.existsSync(root)) {
      continue;
    }

    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const absolutePath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") {
            continue;
          }
          stack.push(absolutePath);
          continue;
        }

        if (!allowedExtensions.has(path.extname(entry.name))) {
          continue;
        }
        if (absolutePath.includes(`${path.sep}dist${path.sep}`)) {
          continue;
        }
        if (entry.name.startsWith("empty.")) {
          continue;
        }

        files.push(absolutePath);
      }
    }
  }

  return asSortedUnique(files);
}

function extractImportSpecifiers(sourceText) {
  const specifiers = [];
  const fromExpression = /(?:import|export)\s+[^;]*?\sfrom\s+["']([^"']+)["']/g;
  const dynamicImportExpression = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
  const requireExpression = /require\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (const expression of [fromExpression, dynamicImportExpression, requireExpression]) {
    for (const match of sourceText.matchAll(expression)) {
      specifiers.push(match[1]);
    }
  }

  return specifiers;
}

function matchesForbiddenImport(specifier, matcher) {
  if (matcher.endsWith("/")) {
    return specifier.startsWith(matcher);
  }

  return specifier === matcher;
}

function checkSharedSourceImports(packageRoot) {
  const sourceFiles = collectPackageSourceFiles(packageRoot);
  const violations = [];

  for (const filePath of sourceFiles) {
    const sourceText = fs.readFileSync(filePath, "utf8");
    const importSpecifiers = extractImportSpecifiers(sourceText);
    for (const importSpecifier of importSpecifiers) {
      const violation = FORBIDDEN_IMPORT_RULES.find((rule) => matchesForbiddenImport(importSpecifier, rule.matcher));
      if (!violation) {
        continue;
      }

      violations.push({
        filePath,
        importSpecifier,
        reason: violation.reason,
      });
    }
  }

  if (violations.length > 0) {
    const formattedViolations = violations
      .map((violation) => {
        const relativePath = path.relative(workspaceRoot, violation.filePath).split(path.sep).join("/");
        return `- ${relativePath}: "${violation.importSpecifier}" (${violation.reason})`;
      })
      .join("\n");
    fail(`Forbidden imports detected in shared domain package:\n${formattedViolations}`);
  }
}

function parseConstObjectValues(sourceText, constName) {
  const expression = new RegExp(`export const ${constName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const;`);
  const match = sourceText.match(expression);
  if (!match) {
    fail(`Unable to parse ${constName} from source.`);
  }

  return asSortedUnique([...match[1].matchAll(/:\s*'([^']+)'/g)].map((entry) => entry[1]));
}

function parseJsConstObjectValues(sourceText, constName) {
  const expression = new RegExp(`export const ${constName}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*;`);
  const match = sourceText.match(expression);
  if (!match) {
    fail(`Unable to parse ${constName} from JS source.`);
  }

  return asSortedUnique([...match[1].matchAll(/:\s*['"]([^'"]+)['"]/g)].map((entry) => entry[1]));
}

function parseEnumValues(sourceText, enumName) {
  const expression = new RegExp(`export enum ${enumName}\\s*\\{([\\s\\S]*?)\\}`);
  const match = sourceText.match(expression);
  if (!match) {
    fail(`Unable to parse enum ${enumName} from source.`);
  }

  return asSortedUnique([...match[1].matchAll(/=\s*'([^']+)'/g)].map((entry) => entry[1]));
}

function resolveCrossApplicationContractPaths(packageRoot) {
  const fixturePath = resolveExistingPath(
    [path.join(packageRoot, "fixtures/party-realtime-events.json")],
    "party realtime fixture file",
  );
  const graphqlFixturePath = resolveExistingPath(
    [path.join(packageRoot, "fixtures/graphql-theme-document-scalar.json")],
    "GraphQL scalar fixture file",
  );

  return {
    backendEventsPath: resolveExistingPath(
      [
        path.join(workspaceRoot, "application/backend/src/presentation/game/party/realtime/party-socket-events.ts"),
        "/usr/src/backend/src/presentation/game/party/realtime/party-socket-events.ts",
        "/usr/src/app/src/presentation/game/party/realtime/party-socket-events.ts",
      ],
      "backend party realtime events source",
    ),
    backendSchemaPath: resolveExistingPath(
      [
        path.join(workspaceRoot, "application/backend/src/schema.gql"),
        "/usr/src/backend/src/schema.gql",
        "/usr/src/app/src/schema.gql",
      ],
      "backend GraphQL schema source",
    ),
    frontendEventsPath: resolveExistingPath(
      [
        path.join(
          workspaceRoot,
          "application/frontend/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
        ),
        "/usr/src/frontend/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
        "/usr/src/app/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
      ],
      "frontend party realtime events source",
    ),
    frontendCodegenPath: resolveExistingPath(
      [
        path.join(workspaceRoot, "application/frontend/codegen.ts"),
        "/usr/src/frontend/codegen.ts",
        "/usr/src/app/codegen.ts",
      ],
      "frontend GraphQL codegen configuration",
    ),
    fixturePath,
    graphqlFixturePath,
    sharedPartyEventsPath: path.join(packageRoot, "party/index.js"),
  };
}

function checkPartyRealtimeFixtures(paths) {
  const fixture = readJson(paths.fixturePath);
  const backendEventsText = fs.readFileSync(paths.backendEventsPath, "utf8");
  const frontendEventsText = fs.readFileSync(paths.frontendEventsPath, "utf8");
  const readBackendOrSharedEvents = (constName) => {
    try {
      return parseConstObjectValues(backendEventsText, constName);
    } catch (error) {
      if (!paths.sharedPartyEventsPath || !backendEventsText.includes("@pleey/domain/party")) {
        throw error;
      }

      const sharedEventsText = fs.readFileSync(paths.sharedPartyEventsPath, "utf8");
      return parseJsConstObjectValues(sharedEventsText, constName);
    }
  };
  const backendInboundEvents = readBackendOrSharedEvents("PARTY_SOCKET_INBOUND_EVENTS");
  const backendOutboundEvents = readBackendOrSharedEvents("PARTY_SOCKET_OUTBOUND_EVENTS");

  const frontendOutboundEvents = asSortedUnique(
    FRONTEND_TO_BACKEND_ENUMS.flatMap((enumName) => parseEnumValues(frontendEventsText, enumName)),
  );
  const frontendInboundEvents = parseEnumValues(frontendEventsText, "SocketIoPartyInboundEventName");

  if (!isSameSortedValues(frontendOutboundEvents, backendInboundEvents)) {
    const missingFromFrontend = backendInboundEvents.filter((eventName) => !frontendOutboundEvents.includes(eventName));
    const missingFromBackend = frontendOutboundEvents.filter((eventName) => !backendInboundEvents.includes(eventName));
    fail(
      [
        "Realtime producer/consumer drift detected for inbound party events.",
        `Missing from frontend outbound enums: ${missingFromFrontend.join(", ") || "none"}.`,
        `Missing from backend inbound constants: ${missingFromBackend.join(", ") || "none"}.`,
      ].join(" "),
    );
  }

  const missingOutboundConsumerEvents = backendOutboundEvents.filter(
    (eventName) => !frontendInboundEvents.includes(eventName),
  );
  if (missingOutboundConsumerEvents.length > 0) {
    fail(
      `Frontend inbound event enum is missing backend outbound event(s): ${missingOutboundConsumerEvents.join(", ")}.`,
    );
  }

  const requiredFixtureKeys = [
    "validClientToServerEvents",
    "invalidClientToServerEvents",
    "validServerToClientEvents",
    "invalidServerToClientEvents",
  ];

  for (const key of requiredFixtureKeys) {
    if (!Array.isArray(fixture[key])) {
      fail(`Fixture key "${key}" must be an array.`);
    }
  }

  const validClientEvents = asSortedUnique(fixture.validClientToServerEvents);
  const validServerEvents = asSortedUnique(fixture.validServerToClientEvents);

  if (!isSameSortedValues(validClientEvents, backendInboundEvents)) {
    fail(
      `Client-to-server fixture events must match backend inbound events. Fixture: ${validClientEvents.join(", ")}. Backend: ${backendInboundEvents.join(", ")}.`,
    );
  }

  if (!isSameSortedValues(validServerEvents, backendOutboundEvents)) {
    fail(
      `Server-to-client fixture events must match backend outbound events. Fixture: ${validServerEvents.join(", ")}. Backend: ${backendOutboundEvents.join(", ")}.`,
    );
  }

  const invalidClientEvents = asSortedUnique(fixture.invalidClientToServerEvents);
  const invalidServerEvents = asSortedUnique(fixture.invalidServerToClientEvents);

  const invalidClientOverlap = invalidClientEvents.filter((eventName) => backendInboundEvents.includes(eventName));
  if (invalidClientOverlap.length > 0) {
    fail(`Invalid client-to-server fixture events overlap with valid backend inbound events: ${invalidClientOverlap.join(", ")}.`);
  }

  const invalidServerOverlap = invalidServerEvents.filter((eventName) => backendOutboundEvents.includes(eventName));
  if (invalidServerOverlap.length > 0) {
    fail(`Invalid server-to-client fixture events overlap with valid backend outbound events: ${invalidServerOverlap.join(", ")}.`);
  }
}

function checkGraphqlScalarContract(paths) {
  const fixture = readJson(paths.graphqlFixturePath);
  const schemaText = fs.readFileSync(paths.backendSchemaPath, "utf8");
  const codegenText = fs.readFileSync(paths.frontendCodegenPath, "utf8");

  const scalarName = fixture.scalarName;
  const expectedFrontendScalarType = fixture.frontendScalarType;

  if (!scalarName || !expectedFrontendScalarType) {
    fail("GraphQL scalar fixture must define scalarName and frontendScalarType.");
  }

  if (!new RegExp(`^scalar\\s+${scalarName}$`, "m").test(schemaText)) {
    fail(`Backend GraphQL schema is missing scalar "${scalarName}".`);
  }

  const mappingMatch = codegenText.match(new RegExp(`${scalarName}:\\s*'([^']+)'`));
  if (!mappingMatch) {
    fail(`Frontend GraphQL codegen config is missing a scalar mapping for "${scalarName}".`);
  }

  const mappedType = mappingMatch[1];
  if (mappedType !== expectedFrontendScalarType) {
    fail(
      `Frontend GraphQL codegen scalar mapping drift for "${scalarName}": expected "${expectedFrontendScalarType}", received "${mappedType}".`,
    );
  }
}

function checkCrossApplicationContracts(packageRoot) {
  const paths = resolveCrossApplicationContractPaths(packageRoot);
  checkPartyRealtimeFixtures(paths);
  checkGraphqlScalarContract(paths);
}

function runProject(projectName) {
  const packageRoot = resolveSharedPackageRoot();
  checkPackageApiSurface(packageRoot);
  checkSharedSourceImports(packageRoot);
  checkCrossApplicationContracts(packageRoot);
}

export {
  checkCrossApplicationContracts,
  checkGraphqlScalarContract,
  checkPackageApiSurface,
  checkPartyRealtimeFixtures,
  checkSharedSourceImports,
  resolveSharedPackageRoot,
  runProject,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runProject(process.argv[2] ?? "local");
}
