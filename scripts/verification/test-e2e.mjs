import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: pnpm test:e2e --phase 02\nRuns Playwright journeys against a run-owned browser/server stack.');
  process.exit(0);
}

const root = process.cwd();
const playwrightArgs = [];
for (let index = 2; index < process.argv.length; index++) {
  if (process.argv[index] === '--phase') {
    index++;
    continue;
  }
  playwrightArgs.push(process.argv[index]);
}
const project = `pleey-e2e-${randomUUID().slice(0, 8)}`;
const workRoot = join(root, '.cache/agent-work');
mkdirSync(workRoot, { recursive: true });
const workDirectory = mkdtempSync(join(workRoot, 'e2e-'));
const composeFiles = ['-f', 'compose.yaml', '-f', 'e2e/compose.usage.yaml'];
const environment = {
  ...process.env,
  COMPOSE_PROJECT_NAME: project,
  USAGE_GID: String(process.getgid?.() ?? 1000),
  USAGE_UID: String(process.getuid?.() ?? 1000),
  USAGE_WORK_DIRECTORY: workDirectory,
};
let failed = false;

function run(command, args) {
  const result = spawnSync(command, args, { env: environment, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
}

try {
  run('docker', ['build', '--target', 'ci', '-f', 'application/backend/Dockerfile', '-t', 'pleey-backend-ci', '.']);
  run('docker', ['build', '--target', 'ci', '-f', 'application/frontend/Dockerfile', '-t', 'pleey-frontend-ci', '.']);
  run('docker', ['compose', '-p', project, ...composeFiles, 'up', '-d', '--no-build', '--wait', 'backend', 'frontend']);
  run('docker', [
    'compose',
    '-p',
    project,
    ...composeFiles,
    'run',
    '--rm',
    '--no-deps',
    '-T',
    '-e',
    'BASE_URL=http://frontend:5173',
    '-e',
    'API_BASE_URL=http://backend:3001/api',
    'e2e-tests',
    'bash',
    '-lc',
    `cd /repository && CI=true npx --yes pnpm@10.32.1 install --frozen-lockfile && CI=true npx --yes pnpm@10.32.1 --filter @pleey/e2e test${playwrightArgs.length ? ` ${playwrightArgs.map((argument) => JSON.stringify(argument)).join(' ')}` : ''}`,
  ]);
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (failed) {
    spawnSync('docker', ['compose', '-p', project, ...composeFiles, 'logs', '--tail=80', 'backend', 'frontend'], {
      env: environment,
      stdio: 'inherit',
    });
  }
  spawnSync('docker', ['compose', '-p', project, ...composeFiles, 'down', '--volumes', '--remove-orphans'], {
    env: environment,
    stdio: 'inherit',
  });
  rmSync(workDirectory, { recursive: true, force: true });
}
