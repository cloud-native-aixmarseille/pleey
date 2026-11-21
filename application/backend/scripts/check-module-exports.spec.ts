import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const checkerPath = [resolve(process.cwd(), '../../scripts/check-module-exports.mjs'), '/usr/src/shared-scripts/check-module-exports.mjs'].find(existsSync);
if (!checkerPath) throw new Error('Unable to locate the module export guard for tests.');
const checkerUrl = pathToFileURL(checkerPath).href;

describe('module export guard', () => {
  it.each([
    ['backend', 'application/game/ports/catalog.ts', "export type { Permission } from './policy';", true],
    ['frontend', 'domains/game/ports/catalog.ts', "export * from './policy';", true],
    ['backend', 'application/game/ports/catalog.ts', "export * as Policy from './policy';", true],
    ['frontend', 'application/game/ports/catalog.ts', "import type { Permission as P } from './policy'; export type { P as Permission };", true],
    ['backend', 'application/game/ports/catalog.ts', "import * as policy from './policy'; export default policy;", true],
    ['backend', 'application/game/ports/catalog.ts', "import type { Permission } from './policy'; export interface Catalog { permission: Permission; }", false],
    ['backend', 'domain/game/services/policy.ts', 'export function resolve() { return true; }', true],
    ['backend', 'application/game/services/policy.ts', 'export const resolve = () => true;', true],
    ['backend', 'domain/game/services/policy.ts', 'export const resolve = function () { return true; };', true],
    ['backend', 'domain/game/services/policy.ts', 'function resolve() { return true; } export { resolve as decide };', true],
    ['backend', 'domain/game/services/policy.ts', 'export default () => true;', true],
    ['backend', 'domain/game/services/policy.ts', 'function resolve() { return true; } export default resolve;', true],
    ['backend', 'domain/game/services/policy.ts', 'export class Policy { resolve() { return true; } }', false],
    ['backend', 'domain/game/services/policy.spec.ts', 'export function testHelper() {}', false],
    ['backend', 'domain/shared/errors/domain-error.ts', 'export function createDomainError() {}', false],
    ['frontend', 'presentation/game/hooks/use-game.ts', 'export function useGame() {}', false],
  ])('%s %s: %s', async (name, fileName, content, rejected) => {
    // Arrange
    const { checkModuleExports } = await import(checkerUrl);
    const directory = mkdtempSync(join(tmpdir(), 'pleey-module-exports-'));
    symlinkSync(resolve(process.cwd(), 'node_modules'), join(directory, 'node_modules'), 'dir');
    const filePath = join(directory, 'src', fileName);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
    try {
      // Act
      const violations = checkModuleExports({ root: directory, name, sourceRootRelativePath: 'src', shouldCheckFile: (file: string) => !file.endsWith('.spec.ts') });
      // Assert
      expect(violations.length > 0).toBe(rejected);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
