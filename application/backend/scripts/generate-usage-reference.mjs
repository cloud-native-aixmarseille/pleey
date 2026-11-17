import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const script = [path.resolve(import.meta.dirname, '../../../scripts/generate-usage-reference.mjs'), '/usr/src/shared-scripts/generate-usage-reference.mjs'].find((file) => fs.existsSync(file));
if (!script) throw new Error('Unable to locate the usage reference generator.');
const { generateUsageReference } = await import(pathToFileURL(script).href);
generateUsageReference(undefined, process.argv.includes('--check'));
