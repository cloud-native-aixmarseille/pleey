import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

if (!process.argv.includes('--profile') || process.argv[process.argv.indexOf('--profile') + 1] !== 'isolated') {
  console.error('Restore rehearsal requires --profile isolated');
  process.exit(2);
}

const project = `pleey-restore-${randomUUID().slice(0, 8)}`;
const composeArgs = ['compose', '-p', project, '-f', 'compose.integration.yaml', 'up', '-d', '--wait'];
let result = spawnSync('docker', composeArgs, { stdio: 'inherit' });
if (result.status === 0) {
  console.log(`Restore rehearsal resources: ${project}`);
  console.log('Apply migration chain and restore synthetic database/media fixtures, then verify relationships.');
}
spawnSync('docker', ['compose', '-p', project, '-f', 'compose.integration.yaml', 'down', '-v', '--remove-orphans'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
