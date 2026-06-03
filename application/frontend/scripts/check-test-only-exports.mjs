import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const candidatePaths = [
	path.resolve(currentDir, '../../../scripts/check-test-only-exports.mjs'),
	path.resolve(currentDir, '../../shared-scripts/check-test-only-exports.mjs'),
];

const sharedScriptPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

if (!sharedScriptPath) {
	throw new Error('Unable to locate shared check-test-only-exports.mjs');
}

const { runCheckTestOnlyExports } = await import(pathToFileURL(sharedScriptPath).href);

runCheckTestOnlyExports(process.argv[2]);
