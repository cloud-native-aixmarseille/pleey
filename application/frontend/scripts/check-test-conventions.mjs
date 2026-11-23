import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const candidatePaths = [
  path.resolve(import.meta.dirname, '../../../scripts/check-test-conventions.mjs'),
  path.resolve(import.meta.dirname, '../../shared-scripts/check-test-conventions.mjs'),
];

const scriptPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

if (!scriptPath) {
  throw new Error('Unable to locate shared check-test-conventions.mjs script.');
}

await import(pathToFileURL(scriptPath).href);