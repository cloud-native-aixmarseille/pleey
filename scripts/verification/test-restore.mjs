import { spawnSync } from 'node:child_process';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: pnpm test:restore --profile isolated');
  process.exit(0);
}

const result = spawnSync('node', ['scripts/operations/restore-rehearsal.mjs', ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
