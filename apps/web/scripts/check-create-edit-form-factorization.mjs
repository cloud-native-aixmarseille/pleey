import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const candidates = [
  path.resolve(import.meta.dirname, '../../../scripts/check-create-edit-form-factorization.mjs'),
  '/usr/src/shared-scripts/check-create-edit-form-factorization.mjs',
];

const sharedScriptPath = candidates.find((candidate) => fs.existsSync(candidate));

if (!sharedScriptPath) {
  throw new Error('Unable to locate the shared create/edit form factorization checker script.');
}

const { runFrontendCreateEditFactorizationCheck } = await import(pathToFileURL(sharedScriptPath).href);

runFrontendCreateEditFactorizationCheck();
