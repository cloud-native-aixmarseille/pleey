const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const http = require('node:http');
const { createRequire } = require('node:module');
const path = require('node:path');

const backendRoot = path.resolve(__dirname, '../../application/backend');
const backendRequire = createRequire(path.join(backendRoot, 'package.json'));
backendRequire('ts-node').register({ project: path.join(backendRoot, 'tsconfig.json'), transpileOnly: true });
const { S3MediaObjectStorage } = backendRequire('./src/infrastructure/media/s3-media-object-storage');
const { S3Client } = backendRequire('@aws-sdk/client-s3');
const { S3RequestPresigner } = backendRequire('@aws-sdk/s3-request-presigner');
const { HttpRequest } = backendRequire('@smithy/protocol-http');
const { formatUrl } = backendRequire('@aws-sdk/util-format-url');

// This smoke check only targets the repository's development Compose services.
const config = {
  endpoint: 'http://localhost:8333',
  region: 'us-east-1',
  bucket: 'pleey-media',
  accessKeyId: 'pleey-media-dev',
  secretAccessKey: 'pleey-media-development-secret',
  forcePathStyle: true,
  publicBaseUrl: 'http://media.pleey.localhost/pleey-media',
  accessTtlSeconds: 300,
};
const deliveryId = execFileSync('docker', ['compose', 'ps', '-q', 'media-delivery'], {
  cwd: path.resolve(__dirname, '../..'),
  encoding: 'utf8',
}).trim();
assert.ok(deliveryId, 'Start media-storage and media-delivery with Docker Compose first');
const networks = JSON.parse(execFileSync('docker', ['inspect', deliveryId, '--format', '{{json .NetworkSettings.Networks}}'], { encoding: 'utf8' }));
const deliveryAddress = Object.values(networks).find((network) => network.Aliases.includes('media-delivery')).IPAddress;

function read(uri, { origin = false, method = 'GET', range } = {}) {
  const url = new URL(uri);
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: origin ? 'localhost' : deliveryAddress,
      port: origin ? 8333 : 8080,
      method,
      path: `${url.pathname}${url.search}`,
      headers: { Host: url.host, ...(range ? { Range: range } : {}) },
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
    });
    request.on('error', reject);
    request.setTimeout(10000, () => request.destroy(new Error('Media delivery request timed out')));
    request.end();
  });
}

async function main() {
  const storage = new S3MediaObjectStorage(config);
  const key = `quiz/${randomUUID()}.webp`;
  const content = Buffer.from('private-media-range-probe');
  try {
    await storage.put(key, { content, mimeType: 'image/webp', extension: 'webp', width: 1, height: 1, durationSeconds: null });
    const grant = await storage.signReadUrl(key);
    const full = await read(grant.uri);
    assert.equal(full.status, 200, `Signed delivery failed: ${full.body}`);
    assert.deepEqual(full.body, content);
    assert.equal(full.headers['cache-control'], 'private, no-store');
    assert.equal(full.headers['content-type'], 'image/webp');
    assert.equal(full.headers['access-control-allow-origin'], '*');
    const range = await read(grant.uri, { range: 'bytes=0-6' });
    assert.equal(range.status, 206);
    assert.deepEqual(range.body, content.subarray(0, 7));
    assert.equal(range.headers['cache-control'], 'private, no-store');
    const signedOrigin = await read(grant.uri, { origin: true });
    assert.equal(signedOrigin.status, 200);
    const unsigned = await read(storage.objectUri(key));
    assert.equal(unsigned.status, 403);
    assert.equal(unsigned.headers['cache-control'], 'private, no-store');
    assert.equal((await read(storage.objectUri(key), { origin: true })).status, 403);
    assert.equal((await read(storage.objectUri(key), { range: 'bytes=0-6' })).status, 403);
    assert.equal((await read(grant.uri, { method: 'HEAD' })).status, 403);
    const tampered = new URL(grant.uri);
    tampered.searchParams.set('X-Amz-Signature', '0'.repeat(64));
    assert.equal((await read(tampered.toString())).status, 403);
    const wrongHost = new URL(grant.uri);
    wrongHost.hostname = 'wrong-host.example.test';
    assert.equal((await read(wrongHost.toString())).status, 403);
    const url = new URL(storage.objectUri(key));
    const client = new S3Client({ region: config.region, credentials: config });
    try {
      const signer = new S3RequestPresigner({ ...client.config });
      const expired = await signer.presign(new HttpRequest({
        protocol: url.protocol, hostname: url.hostname, path: url.pathname, method: 'GET', headers: { host: url.host },
      }), { expiresIn: 60, signingDate: new Date(Date.now() - 120000) });
      assert.equal((await read(formatUrl(expired))).status, 403);
      assert.equal((await read(formatUrl(expired), { origin: true })).status, 403);
      assert.equal((await read(formatUrl(expired), { range: 'bytes=0-6' })).status, 403);
    } finally {
      client.destroy();
    }
    assert.equal((await read(storage.objectUri(key), { method: 'OPTIONS' })).status, 204);
    process.stdout.write('Signed GET, range, origin privacy, CORS, no-store, tampering, expiry, and HEAD replay checks passed.\n');
  } finally {
    await storage.delete(key);
    storage.onModuleDestroy();
  }
}
main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
