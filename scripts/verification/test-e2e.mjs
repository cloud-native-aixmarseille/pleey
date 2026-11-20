import { spawnSync } from 'node:child_process';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: pnpm test:e2e --phase 01\nRuns critical Playwright journeys through the production proxy.');
  process.exit(0);
}

const result = spawnSync('pnpm', ['--filter', '@pleey/e2e', 'test'], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
