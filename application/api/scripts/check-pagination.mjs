import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const candidates = [
	path.resolve(import.meta.dirname, '../../../scripts/check-pagination.mjs'),
	'/usr/src/shared-scripts/check-pagination.mjs',
];

const sharedScriptPath = candidates.find((candidate) => fs.existsSync(candidate));

if (!sharedScriptPath) {
	throw new Error('Unable to locate the shared pagination checker script.');
}

const { runProject } = await import(pathToFileURL(sharedScriptPath).href);

runProject('backend');