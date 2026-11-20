import { spawnSync } from 'node:child_process';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: pnpm test:upgrade --phase 01 --from path/to/approved-release.json --to path/to/candidate-release.json');
  process.exit(0);
}

const result = spawnSync('node', ['scripts/operations/upgrade-rehearsal.mjs', ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
