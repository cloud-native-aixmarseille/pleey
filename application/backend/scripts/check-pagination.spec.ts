import { existsSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as graphql from 'graphql';
import { describe, expect, it } from 'vitest';

const sharedCheckerPath = [resolve(process.cwd(), '../../scripts/check-pagination.mjs'), '/usr/src/shared-scripts/check-pagination.mjs'].find(existsSync);
if (!sharedCheckerPath) throw new Error('Unable to locate the pagination guard for tests.');
const sharedChecker = pathToFileURL(sharedCheckerPath).href;
const definitions = `
  declare function Query(output: unknown): MethodDecorator;
  class PaginationInput { page = 1; pageSize = 9; }
  class Item { id!: string; }
  function Paginated(item: typeof Item) {
    class PaginatedType { items!: Item[]; page!: number; pageSize!: number; totalPages!: number; totalCount!: number; overallCount!: number; }
    return PaginatedType;
  }
  const PageBase = Paginated(Item);
  class ItemPage extends PageBase {}
`;

// These fixtures exercise the checker against newly added code, including aliases,
// rather than asserting a snapshot of currently compliant production files.
describe('pagination guard', () => {
  it.each([
    ['accepts a shared page', `@Query(() => ItemPage) list(input: PaginationInput): ItemPage { return {} as ItemPage; }`, false],
    ['rejects a raw list', `@Query(() => [Item]) list(): Item[] { return []; }`, true],
    ['rejects a custom array wrapper', `@Query(() => Item) list() { return { entries: [] as Item[] }; }`, true],
    ['rejects missing pagination input', `@Query(() => ItemPage) list(): ItemPage { return {} as ItemPage; }`, true],
  ])('%s', async (_name, method, rejected) => {
    // Arrange
    const { checkBackendPagination } = await import(sharedChecker);
    const directory = mkdtempSync(join(tmpdir(), 'pleey-pagination-guard-'));
    mkdirSync(join(directory, 'src'));
    symlinkSync(resolve(process.cwd(), 'node_modules'), join(directory, 'node_modules'), 'dir');
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: { experimentalDecorators: true, skipLibCheck: true }, include: ['src/*.ts'] }));
    writeFileSync(join(directory, 'src/resolver.ts'), `${definitions}\nclass Resolver { ${method} }`);
    try {
      // Act
      const failures = checkBackendPagination(directory, new Map());
      // Assert
      expect(failures.length > 0).toBe(rejected);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    ['accepts deterministic bounded reads', "[{ createdAt: 'desc' }, { id: 'desc' }]", 'skip: pagination.skip, take: pagination.pageSize,', false],
    ['rejects bypassed limits', "[{ id: 'asc' }]", 'skip: 0, take: 1000000,', true],
    ['rejects unbounded reads', "[{ id: 'asc' }]", '', true],
    ['rejects unstable ordering', "[{ createdAt: 'desc' }]", 'skip: pagination.skip, take: pagination.pageSize,', true],
  ])('%s', async (_name, order, window, rejected) => {
    // Arrange
    const { checkBackendPagination } = await import(sharedChecker);
    const directory = mkdtempSync(join(tmpdir(), 'pleey-pagination-guard-'));
    mkdirSync(join(directory, 'src'));
    symlinkSync(resolve(process.cwd(), 'node_modules'), join(directory, 'node_modules'), 'dir');
    writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({ compilerOptions: { skipLibCheck: true }, include: ['src/*.ts'] }));
    writeFileSync(join(directory, 'src/repository.ts'), `declare const prisma: any; declare class PaginationQueryNormalizer { normalizeQuery(input: object): { skip: number; pageSize: number }; } declare const normalizer: PaginationQueryNormalizer; class Repository { list() { const pagination = normalizer.normalizeQuery({}); const ordering = ${order}; return prisma.$transaction([prisma.item.findMany({ ${window} orderBy: ordering })], { isolationLevel: 'RepeatableRead' }); } }`);
    try {
      // Act
      const failures = checkBackendPagination(directory, new Map());
      // Assert
      expect(failures.length > 0).toBe(rejected);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it.each([
    ['accepts metadata in fragments', 'query($input: PaginationInput!) { things(input: $input) { ...PageFields } } fragment PageFields on Page { items { id } page pageSize totalPages totalCount overallCount }', false],
    ['rejects missing navigation metadata', 'query($input: PaginationInput!) { things(input: $input) { items { id } } }', true],
    ['rejects missing pagination input', 'query { things { items { id } page pageSize totalPages totalCount overallCount } }', true],
  ])('%s', async (_name, document, rejected) => {
    // Arrange
    const { checkPaginationOperations } = await import(sharedChecker);
    const schema = 'input PaginationInput { page: Int pageSize: Int } type Item { id: ID! } type Page { items: [Item!]! page: Int! pageSize: Int! totalPages: Int! totalCount: Int! overallCount: Int! } type Query { things(input: PaginationInput): Page! }';
    // Act
    const failures = checkPaginationOperations(schema, [['operation.graphql', document]], graphql);
    // Assert
    expect(failures.length > 0).toBe(rejected);
  });
});
