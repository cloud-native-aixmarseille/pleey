// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const script = [path.resolve(import.meta.dirname, '../../../scripts/check-user-docs.mjs'), '/usr/src/shared-scripts/check-user-docs.mjs'].find(fs.existsSync);
const { inspectMarkdown, validateGuide, validateMarkdownLinks } = await import(pathToFileURL(script!).href);
const guide = { id: 'example', titleKey: 'guide.title', docPath: 'example.md', steps: [{ i18nKey: 'guide.body', titleKey: 'guide.title', anchor: 'example', docAnchor: 'example', route: '/example' }] };
const resources = { en: { translation: { guide: { body: 'Body', title: 'Title' } } }, fr: { translation: { guide: { body: 'Texte', title: 'Titre' } } } };
const page = '# Example\n\n[Start](http://pleey.localhost/example?guide=example)';
describe('user documentation guard', () => {
  it.each(['i18nKey', 'titleKey', 'docAnchor', 'anchor', 'route'])('rejects a broken %s reference', (field) => {
    // Arrange
    const broken = { ...guide, steps: [{ ...guide.steps[0], [field]: 'missing' }] };
    // Act + Assert
    expect(() => validateGuide(broken, resources, () => page, 'data-tour="example"')).toThrow();
  });
  it('resolves reference links and duplicate GitHub heading slugs', () => {
    // Arrange
    const markdown = '# Title\n\n## A `label`\n\n## A `label`\n\n[Link][ref]\n\n[ref]: other.md#a-label-1';
    // Act
    const parsed = inspectMarkdown(markdown);
    // Assert
    expect([...parsed.anchors]).toEqual(['title', 'a-label', 'a-label-1']);
    expect(parsed.links).toEqual(['other.md#a-label-1']);
  });
  it.each(['missing.md', 'target.md#missing'])('rejects a broken local link: %s', (link) => {
    // Arrange
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pleey-docs-'));
    fs.writeFileSync(path.join(root, 'index.md'), `[Link](${link})`);
    fs.writeFileSync(path.join(root, 'target.md'), '# Target');
    // Act + Assert
    try { expect(() => validateMarkdownLinks(path.join(root, 'index.md'), root)).toThrow(); }
    finally { fs.rmSync(root, { recursive: true }); }
  });
});


describe('screenshot freshness guard', () => {
  it.each(['source', 'image'])('rejects a changed %s', async (changed) => {
    // Arrange
    const checker = path.join(path.dirname(script!), 'check-usage-screenshots.mjs');
    const { usageScreenshotSourceHash, checkUsageScreenshots } = await import(pathToFileURL(checker).href);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pleey-screenshots-'));
    const inputs = [
      'application/frontend/src/presentation/example/guide/example.guide.ts',
      'application/frontend/src/i18n/translation-resource-composer.ts',
      'application/frontend/pnpm-lock.yaml', 'e2e/pnpm-lock.yaml',
      'e2e/tests/usage/guides.spec.ts', 'e2e/usage.config.ts', 'e2e/playwright.config.ts', 'application/backend/prisma/seed.ts',
    ];
    for (const file of inputs) { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), ''); }
    fs.writeFileSync(path.join(root, inputs[0]!), `export const guide = ${JSON.stringify(guide)};`);
    fs.writeFileSync(path.join(root, inputs[1]!), 'export class TranslationResourceComposer { compose() { return {}; } }');
    const assets = path.join(root, 'docs/usage/assets');
    fs.mkdirSync(assets, { recursive: true });
    const png = Buffer.from('89504e470d0a1a0a', 'hex');
    const screenshots = Object.fromEntries(['en', 'fr'].map((locale) => {
      const name = `example-example-${locale}.png`;
      fs.writeFileSync(path.join(assets, name), png);
      return [name, createHash('sha256').update(png).digest('hex')];
    }));
    fs.writeFileSync(path.join(assets, 'manifest.json'), JSON.stringify({ sourceHash: usageScreenshotSourceHash(root), screenshots }));
    // Act
    fs.appendFileSync(changed === 'source' ? path.join(root, inputs[0]!) : path.join(assets, 'example-example-en.png'), 'changed');
    // Assert
    try { expect(() => checkUsageScreenshots(root)).toThrow(changed === 'source' ? 'inputs changed' : 'changed outside capture'); }
    finally { fs.rmSync(root, { recursive: true }); }
  });
});


describe('generated reference freshness', () => {
  it('rejects edits to generated fragments', async () => {
    // Arrange
    const generator = path.join(path.dirname(script!), 'generate-usage-reference.mjs');
    const { updateGeneratedUsage } = await import(pathToFileURL(generator).href);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pleey-generated-'));
    const expected = new Map([['settings.md', '# Settings\n']]);
    fs.writeFileSync(path.join(root, 'settings.md'), '# Old settings\n');
    // Act + Assert
    try { expect(() => updateGeneratedUsage(root, expected, true)).toThrow('Stale generated documentation'); }
    finally { fs.rmSync(root, { recursive: true }); }
  });
});
