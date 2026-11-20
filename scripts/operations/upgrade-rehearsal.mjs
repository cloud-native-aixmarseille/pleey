import { existsSync, readFileSync } from 'node:fs';

const fromIndex = process.argv.indexOf('--from');
const toIndex = process.argv.indexOf('--to');
if (fromIndex < 0 || toIndex < 0) {
  console.error('Missing --from and --to release manifest paths');
  process.exit(2);
}

for (const path of [process.argv[fromIndex + 1], process.argv[toIndex + 1]]) {
  if (!path || !existsSync(path)) {
    console.error(`Missing release manifest: ${path ?? ''}`);
    process.exit(1);
  }
  JSON.parse(readFileSync(path, 'utf8'));
}

console.log('Validated previous and candidate release manifests; execute migration rehearsal in the isolated deployment environment.');
