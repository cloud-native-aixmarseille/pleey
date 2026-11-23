/**
 * Cross-stack dead-surface detector.
 *
 * The backend exposes its end-user surface exclusively through GraphQL root
 * fields (Query / Mutation / Subscription). A root field is only "useful" when
 * an actual frontend operation document selects it: that is the single entry
 * point a real end user can reach. Any backend root field that no frontend
 * `.graphql` operation references is therefore dead surface, and the resolver +
 * use-case + repository method chain behind it is reachable by nobody.
 *
 * This script compares:
 *   - exposed:  root fields declared in the backend schema (schema.gql)
 *   - consumed: root fields selected by the frontend operation documents
 * and fails (exit 1) when a backend root field is never consumed.
 *
 * Usage: node scripts/check-graphql-usage.mjs
 *
 * Intentionally-exposed-but-unconsumed fields (e.g. infra probes) can be listed
 * in ALLOWED_UNUSED with a justification.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSchema, Kind, parse } from 'graphql';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');
const operationsRoot = path.join(frontendRoot, 'src', 'infrastructure');

const schemaPathCandidates = [
  process.env.CODEGEN_SCHEMA,
  '../backend/src/schema.gql',
  '../../application/backend/src/schema.gql',
  '/usr/src/backend/src/schema.gql',
]
  .filter((candidate) => typeof candidate === 'string' && candidate.length > 0)
  .map((candidate) =>
    path.isAbsolute(candidate) ? candidate : path.resolve(frontendRoot, candidate),
  );

const schemaPath = schemaPathCandidates.find((candidate) => fs.existsSync(candidate));

/**
 * Backend root fields that are deliberately exposed without a frontend consumer.
 * Each entry MUST document why it is exempt so the allowlist cannot rot silently.
 */
const ALLOWED_UNUSED = new Map([
  // example: ['Query.someInternalProbe', 'Consumed by k8s HTTP probe, not GraphQL'],
]);

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!schemaPath) {
  fail(
    `✗ GraphQL schema not found. Tried:\n${schemaPathCandidates.map((candidate) => `  - ${candidate}`).join('\n')}`,
  );
}

function collectExposedRootFields() {
  const schema = buildSchema(fs.readFileSync(schemaPath, 'utf8'));
  const roots = [
    ['Query', schema.getQueryType()],
    ['Mutation', schema.getMutationType()],
    ['Subscription', schema.getSubscriptionType()],
  ];

  const exposed = new Map();
  for (const [operation, type] of roots) {
    if (!type) {
      continue;
    }
    for (const fieldName of Object.keys(type.getFields())) {
      exposed.set(`${operation}.${fieldName}`, { operation, fieldName });
    }
  }
  return exposed;
}

function walkGraphqlFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkGraphqlFiles(full));
    } else if (entry.name.endsWith('.graphql')) {
      results.push(full);
    }
  }
  return results;
}

const OPERATION_BY_KIND = {
  query: 'Query',
  mutation: 'Mutation',
  subscription: 'Subscription',
};

function collectConsumedRootFields(files) {
  const consumed = new Set();
  for (const file of files) {
    let document;
    try {
      document = parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      fail(`✗ Failed to parse ${path.relative(frontendRoot, file)}: ${error.message}`);
    }
    for (const definition of document.definitions) {
      if (definition.kind !== Kind.OPERATION_DEFINITION) {
        continue;
      }
      const operation = OPERATION_BY_KIND[definition.operation];
      for (const selection of definition.selectionSet.selections) {
        if (selection.kind === Kind.FIELD) {
          consumed.add(`${operation}.${selection.name.value}`);
        }
      }
    }
  }
  return consumed;
}

const exposed = collectExposedRootFields();
const operationFiles = walkGraphqlFiles(operationsRoot);
const consumed = collectConsumedRootFields(operationFiles);

const violations = [];
for (const [key, { operation, fieldName }] of exposed) {
  if (consumed.has(key) || ALLOWED_UNUSED.has(key)) {
    continue;
  }
  violations.push({ key, operation, fieldName });
}

if (operationFiles.length === 0) {
  fail(`✗ No frontend GraphQL operations found under ${path.relative(frontendRoot, operationsRoot)}`);
}

if (violations.length > 0) {
  console.error('✗ Dead backend GraphQL surface: root fields with no frontend consumer.\n');
  console.error('  These fields are unreachable from any end user. Remove the resolver and');
  console.error('  its now-orphaned use-cases / repository methods, or add a justified entry');
  console.error('  to ALLOWED_UNUSED in scripts/check-graphql-usage.mjs.\n');
  for (const { operation, fieldName } of violations.sort((a, b) => a.key.localeCompare(b.key))) {
    console.error(`  - ${operation}.${fieldName}`);
  }
  console.error(`\n  ${violations.length} dead root field(s) found.`);
  process.exit(1);
}

console.log(
  `✓ GraphQL surface clean: all ${exposed.size} backend root field(s) are consumed by the frontend.`,
);
