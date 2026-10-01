// A separate process keeps native decoder allocations and crashes out of the API.
// Arguments are passed directly to Node, never interpolated into this source or a shell.
export const SHARP_WORKER_SOURCE = `
const sharp = require(process.argv[1]);
const fs = require('node:fs/promises');
const [input, output, expectedFormat] = process.argv.slice(2);
sharp.cache(false);
sharp.concurrency(1);
async function processImage() {
  const options = { limitInputPixels: 25000000, failOn: 'warning' };
  const metadata = await sharp(input, options).metadata();
  if (metadata.format !== expectedFormat || (metadata.pages || 1) !== 1) {
    process.exitCode = 1;
    return;
  }
  for (const quality of [80, 75, 70, 65]) {
    const { data, info } = await sharp(input, options)
      .autoOrient()
      .resize({ width: 1600, height: 900, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    if (data.length > 524288) continue;
    const verified = await sharp(data, options).metadata();
    if (verified.format !== 'webp' || verified.width !== info.width || verified.height !== info.height) {
      process.exitCode = 1;
      return;
    }
    await fs.writeFile(output, data, { mode: 0o600 });
    process.stdout.write(JSON.stringify({ width: info.width, height: info.height }));
    return;
  }
  process.exitCode = 1;
}
processImage().catch(() => { process.exitCode = 1; });
`;
