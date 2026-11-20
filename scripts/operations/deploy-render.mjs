import { spawnSync } from 'node:child_process';

const profile = process.argv.includes('--profile') ? process.argv[process.argv.indexOf('--profile') + 1] : 'helm';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: pnpm deploy:render --profile helm|compose');
  process.exit(0);
}

let result;
if (profile === 'helm') {
  result = spawnSync('helm', [
    'template',
    'pleey',
    'charts/application',
    '--set',
    'backend.passwordRecovery.frontendUrl=https://pleey.example.test',
    '--set',
    'backend.passwordRecovery.smtp.from=Pleey <noreply@pleey.example.test>',
    '--set',
    'backend.smtp.config.general.ALLOWED_SENDER_DOMAINS=pleey.example.test',
    '--set',
    'backend.media.bucket=pleey-media',
    '--set',
    'backend.media.endpoint=https://storage.example.test',
    '--set',
    'backend.media.publicBaseUrl=https://media.example.test/pleey-media',
    '--set',
    'backend.media.accessKeyId=test-access',
    '--set',
    'backend.media.secretAccessKey=test-secret',
  ], { stdio: 'inherit' });
} else if (profile === 'compose') {
  result = spawnSync('docker', ['compose', '-f', 'compose.production.yaml', 'config', '--no-interpolate'], { stdio: 'inherit' });
} else {
  console.error(`Unknown profile: ${profile}`);
  process.exit(2);
}
process.exit(result.status ?? 1);
