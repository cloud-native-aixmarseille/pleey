import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const candidates = [
  path.resolve(import.meta.dirname, '../../../scripts/check-invariant-arguments.mjs'),
  '/usr/src/shared-scripts/check-invariant-arguments.mjs',
];

const sharedScriptPath = candidates.find((candidate) => fs.existsSync(candidate));

if (!sharedScriptPath) {
  throw new Error('Unable to locate the shared invariant argument checker script.');
}

const { runProject } = await import(pathToFileURL(sharedScriptPath).href);

runProject('frontend');