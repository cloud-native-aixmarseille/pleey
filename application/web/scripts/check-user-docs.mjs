import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const script = [path.resolve(import.meta.dirname, '../../../scripts/check-user-docs.mjs'), '/usr/src/shared-scripts/check-user-docs.mjs'].find((file) => fs.existsSync(file));
if (!script) throw new Error('Unable to locate the user documentation checker.');
const { checkUserDocs } = await import(pathToFileURL(script).href);
checkUserDocs();
