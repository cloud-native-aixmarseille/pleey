import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const checkerPath = [
  resolve(process.cwd(), '../../scripts/check-presentation-screens.mjs'),
  '/usr/src/shared-scripts/check-presentation-screens.mjs',
].find(existsSync);
if (!checkerPath) throw new Error('Unable to locate the presentation screen guard.');

describe('Presentation screen guard', () => {
  it.each([
    ['accepts theme feature components', 'theme/components/theme-select-field.tsx', '', 0],
    ['accepts reusable components in other features', 'identity/components/avatar.tsx', '', 0],
    ['accepts shared workspace components', 'workspace/shared/components/navigation.tsx', '', 0],
    ['accepts screen-local components', 'workspace/organizations/screens/management/components/form.tsx', '', 0],
    ['rejects misplaced nested components', 'workspace/organizations/components/form.tsx', '', 1],
    [
      'retains interactive screen size limits',
      'theme/screens/library/theme-screen.tsx',
      `import { useState } from 'react';\n${'// line\n'.repeat(220)}`,
      1,
    ],
    ['retains static screen size limits', 'theme/screens/library/theme-screen.tsx', '// line\n'.repeat(321), 1],
  ])('%s', (_name, file, content, expectedStatus) => {
    // Arrange
    const root = mkdtempSync(join(tmpdir(), 'pleey-presentation-guard-'));
    const script = join(root, 'scripts/check-presentation-screens.mjs');
    const source = join(root, 'application/frontend/src/presentation', file);
    try {
      mkdirSync(dirname(script), { recursive: true });
      copyFileSync(checkerPath, script);
      mkdirSync(dirname(source), { recursive: true });
      writeFileSync(source, content);

      // Act
      const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });

      // Assert
      expect(result.status, result.stdout + result.stderr).toBe(expectedStatus);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
