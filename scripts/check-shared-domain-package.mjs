import fs from "node:fs";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");

const EXPECTED_EXPORT_ENTRIES = [
  ".",
  "./errors",
  "./game",
  "./identifier",
  "./identity",
  "./i18n",
  "./media",
  "./organization",
  "./package.json",
  "./party",
  "./project",
  "./shared/primitives",
  "./theme",
].sort();

const EXPECTED_PACKAGE_FILES = [
  "README.md",
  "dist/",
  "errors/",
  "game/",
  "identifier/",
  "identity/",
  "i18n/",
  "media/",
  "organization/",
  "package.json",
  "party/",
  "project/",
  "shared/",
  "theme/",
].sort();

const SUPERSEDED_APPLICATION_CONTRACTS = [
  "apps/api/src/domain/game/entities/game.ts",
  "apps/api/src/domain/game/party/enums/party-role.enum.ts",
  "apps/api/src/domain/game/party/enums/party-status.enum.ts",
  "apps/api/src/domain/game/party/enums/party-player-kind.enum.ts",
  "apps/api/src/domain/game/party/player/entities/party-player-identity.ts",
  "apps/api/src/domain/game/party/shared/entities/party-action.ts",
  "apps/api/src/domain/game/party/shared/entities/party-settings.ts",
  "apps/api/src/domain/game/party/shared/entities/party-stage.ts",
  "apps/api/src/domain/game/party/shared/entities/party.ts",
  "apps/api/src/domain/game/party/host/value-objects/host-party-permissions.ts",
  "apps/api/src/domain/game/types/shared/entities/game-type.ts",
  "apps/api/src/domain/identity/enums/captcha-action.enum.ts",
  "apps/api/src/domain/identity/types/auth-token.ts",
  "apps/api/src/domain/organization/enums/organization-role.enum.ts",
  "apps/api/src/domain/shared/value-objects/pagination-limits.ts",
  "apps/api/src/domain/theme/entities/theme-id.ts",
  "apps/api/src/domain/theme/entities/theme-document.ts",
  "apps/api/src/domain/theme/value-objects/theme-permissions.ts",
  "apps/api/src/packages/contracts/services/identifier-parser/identifier-parser.ts",
  "apps/api/src/domain/theme/services/curated-theme-palettes.ts",
  "apps/api/src/domain/theme/services/cyber-arcade-theme-palette.ts",
  "apps/api/src/domain/theme/services/solar-grid-theme-palette.ts",
  "apps/web/src/domains/game/entities/game.ts",
  "apps/web/src/domains/game/party/shared/entities/party-action.ts",
  "apps/web/src/domains/game/party/shared/entities/party-role.ts",
  "apps/web/src/domains/game/party/shared/entities/party-settings.ts",
  "apps/web/src/domains/game/party/shared/entities/party-stage.ts",
  "apps/web/src/domains/game/party/shared/entities/party-status.ts",
  "apps/web/src/domains/game/types/shared/game-type.ts",
  "apps/web/src/domains/identity/entities/auth-session.ts",
  "apps/web/src/domains/identity/entities/guest.ts",
  "apps/web/src/domains/organization/value-objects/organization-permissions.ts",
  "apps/web/src/domains/project/value-objects/project-permissions.ts",
  "apps/web/src/domains/shared/value-objects/pagination-limits.ts",
  "apps/web/src/domains/theme/entities/theme-id.ts",
  "apps/web/src/domains/theme/entities/theme-document.ts",
  "apps/web/src/domains/theme/value-objects/theme-permissions.ts",
  "apps/web/src/packages/contracts/services/identifier-parser/identifier-parser.ts",
  "apps/web/src/domains/theme/services/curated-theme-palettes.ts",
  "apps/web/src/domains/theme/services/cyber-arcade-theme-palette.ts",
  "apps/web/src/domains/theme/services/solar-grid-theme-palette.ts",
];

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
    [path.join(workspaceRoot, "packages/contracts"), "/usr/src/shared"],
    "shared domain package root",
  );
}

function checkPackageApiSurface(packageRoot) {
  const packageJsonPath = path.join(packageRoot, "package.json");
  const packageJson = readJson(packageJsonPath);

  if (packageJson.name !== "@pleey/contracts") {
    fail(`Unexpected shared package name: ${packageJson.name}`);
  }

  const exportEntries = asSortedUnique(Object.keys(packageJson.exports ?? {}));
  if (!isSameSortedValues(exportEntries, EXPECTED_EXPORT_ENTRIES)) {
    fail(
      `Unexpected shared package exports. Expected ${EXPECTED_EXPORT_ENTRIES.join(", ")}, received ${exportEntries.join(", ")}`,
    );
  }

  const packageFiles = asSortedUnique(packageJson.files ?? []);
  if (!isSameSortedValues(packageFiles, EXPECTED_PACKAGE_FILES)) {
    fail(
      `Unexpected shared package files. Expected ${EXPECTED_PACKAGE_FILES.join(", ")}, received ${packageFiles.join(", ")}`,
    );
  }

  for (const exportName of EXPECTED_EXPORT_ENTRIES) {
    if (exportName === "./package.json") continue;
    const exportEntry = packageJson.exports[exportName];
    for (const condition of ["types", "import", "default"]) {
      const target = exportEntry?.[condition] ?? (condition === "default" ? exportEntry : null);
      if (typeof target !== "string" || !fs.existsSync(path.join(packageRoot, target))) {
        fail(`Shared package export "${exportName}" has no valid ${condition} target.`);
      }
    }
  }
}

function checkSupersededApplicationContracts(root = workspaceRoot) {
  const repositoryRoot = root;

  const restoredContracts = SUPERSEDED_APPLICATION_CONTRACTS.filter((file) =>
    fs.existsSync(path.join(repositoryRoot, file)),
  );
  if (restoredContracts.length > 0) {
    fail(`Superseded application contracts must remain removed:\n${restoredContracts.map((file) => `- ${file}`).join("\n")}`);
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
  const nonTypeScriptFiles = sourceFiles.filter((filePath) => !filePath.endsWith(".ts") || filePath.endsWith(".d.ts"));
  if (nonTypeScriptFiles.length > 0) {
    fail(
      `Shared domain package source must be TypeScript-only:\n${nonTypeScriptFiles
        .map((filePath) => `- ${path.relative(workspaceRoot, filePath).split(path.sep).join("/")}`)
        .join("\n")}`,
    );
  }

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

  return asSortedUnique(
    [...match[1].matchAll(/:\s*["']([^"']+)["']/g)].map((entry) => entry[1]),
  );
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
    [
      path.join(workspaceRoot, "scripts/fixtures/shared-domain/party-realtime-events.json"),
      "/usr/src/shared-scripts/fixtures/shared-domain/party-realtime-events.json",
    ],
    "party realtime fixture file",
  );
  const graphqlFixturePath = resolveExistingPath(
    [
      path.join(workspaceRoot, "scripts/fixtures/shared-domain/graphql-theme-document-scalar.json"),
      "/usr/src/shared-scripts/fixtures/shared-domain/graphql-theme-document-scalar.json",
    ],
    "GraphQL scalar fixture file",
  );

  return {
    backendEventsPath: resolveExistingPath(
      [
        path.join(workspaceRoot, "apps/api/src/presentation/game/party/realtime/party-socket-events.ts"),
        "/usr/src/backend/src/presentation/game/party/realtime/party-socket-events.ts",
        "/usr/src/app/src/presentation/game/party/realtime/party-socket-events.ts",
      ],
      "backend party realtime events source",
    ),
    backendSchemaPath: resolveExistingPath(
      [
        path.join(workspaceRoot, "apps/api/src/schema.gql"),
        "/usr/src/backend/src/schema.gql",
        "/usr/src/app/src/schema.gql",
      ],
      "backend GraphQL schema source",
    ),
    frontendEventsPath: resolveExistingPath(
      [
        path.join(
          workspaceRoot,
          "apps/web/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
        ),
        "/usr/src/frontend/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
        "/usr/src/app/src/infrastructure/game/party/shared/socket-io-party-realtime.types.ts",
      ],
      "frontend party realtime events source",
    ),
    frontendCodegenPath: resolveExistingPath(
      [
        path.join(workspaceRoot, "apps/web/codegen.ts"),
        "/usr/src/frontend/codegen.ts",
        "/usr/src/app/codegen.ts",
      ],
      "frontend GraphQL codegen configuration",
    ),
    fixturePath,
    graphqlFixturePath,
    sharedPartyEventsPath: path.join(packageRoot, "party/index.ts"),
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
      if (!paths.sharedPartyEventsPath || !backendEventsText.includes("@pleey/contracts/party")) {
        throw error;
      }

      const sharedEventsText = fs.readFileSync(paths.sharedPartyEventsPath, "utf8");
      return parseConstObjectValues(sharedEventsText, constName);
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
  checkSupersededApplicationContracts();
  checkCrossApplicationContracts(packageRoot);
}

export {
  checkCrossApplicationContracts,
  checkGraphqlScalarContract,
  checkPackageApiSurface,
  checkPartyRealtimeFixtures,
  checkSharedSourceImports,
  checkSupersededApplicationContracts,
  resolveSharedPackageRoot,
  runProject,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  runProject(process.argv[2] ?? "local");
}
