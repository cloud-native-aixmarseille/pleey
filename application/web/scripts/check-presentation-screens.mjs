import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const candidates = [
  path.resolve(import.meta.dirname, '../../../scripts/check-presentation-screens.mjs'),
  '/usr/src/shared-scripts/check-presentation-screens.mjs',
];

const sharedScriptPath = candidates.find((candidate) => fs.existsSync(candidate));

if (!sharedScriptPath) {
  throw new Error('Unable to locate the shared presentation screen checker script.');
}

await import(pathToFileURL(sharedScriptPath).href);