import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const sharedCheckerPath = [
  resolve(process.cwd(), '../../scripts/check-invariant-arguments.mjs'),
  '/usr/src/shared-scripts/check-invariant-arguments.mjs',
].find(existsSync);
if (!sharedCheckerPath) throw new Error('Unable to locate the invariant argument guard for tests.');
const sharedChecker = pathToFileURL(sharedCheckerPath).href;

describe('invariant argument guard', () => {
  it.each([
    ['accepts repeated mutable instance state', 'this.accessToken', false],
    ['rejects repeated literals', "'fixed-token'", true],
    ['rejects repeated module constants', 'FIXED_TOKEN', true],
  ])('%s', async (_name, argument, rejected) => {
    // Arrange
    const { checkInvariantArguments } = await import(sharedChecker);
    const directory = mkdtempSync(join(tmpdir(), 'pleey-invariant-guard-'));
    mkdirSync(join(directory, 'src'));
    symlinkSync(resolve(process.cwd(), 'node_modules'), join(directory, 'node_modules'), 'dir');
    writeFileSync(
      join(directory, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { noLib: true, types: [] }, include: ['src/*.ts'] }),
    );
    writeFileSync(join(directory, 'src/client.ts'), `
      const FIXED_TOKEN = 'fixed-token';
      function matches(token: string) { return token === FIXED_TOKEN; }
      class Client {
        accessToken = 'initial-token';
        verify() {
          matches(${argument});
          this.accessToken = 'rotated-token';
          matches(${argument});
        }
      }
    `);
    try {
      // Act
      const violations = checkInvariantArguments({
        root: directory,
        sourceRootRelativePath: 'src',
        shouldCheckFile: () => true,
      });
      // Assert
      expect(violations.length > 0).toBe(rejected);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
