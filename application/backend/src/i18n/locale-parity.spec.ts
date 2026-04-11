import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function flattenTranslationKeys(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => flattenTranslationKeys(entry, `${prefix}[${index}]`));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, entry]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      return flattenTranslationKeys(entry, nextPrefix);
    });
  }

  return prefix ? [prefix] : [];
}

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'coverage') {
        return [];
      }

      return listSourceFiles(entryPath);
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

function collectStaticBackendTranslationKeys(
  directory: string,
  namespaces: readonly string[],
): string[] {
  const keys = new Set<string>();
  const stringLiteralPattern = /['"`]([^'"`\n]+)['"`]/g;

  for (const filePath of listSourceFiles(directory)) {
    const fileContent = readFileSync(filePath, 'utf8');

    stringLiteralPattern.lastIndex = 0;

    for (const match of fileContent.matchAll(stringLiteralPattern)) {
      const value = match[1];

      if (namespaces.some((namespace) => value.startsWith(`${namespace}.`))) {
        keys.add(value);
      }
    }
  }

  return [...keys].sort();
}

describe('backend locale parity', () => {
  const localeDirectory = join(process.cwd(), 'src', 'i18n');
  const englishDirectory = join(localeDirectory, 'en');
  const frenchDirectory = join(localeDirectory, 'fr');
  const localeFiles = readdirSync(englishDirectory).filter((fileName) =>
    fileName.endsWith('.json'),
  );
  const namespaces = localeFiles.map((localeFile) => localeFile.replace(/\.json$/, ''));

  for (const localeFile of localeFiles) {
    it(`keeps en and fr keys aligned for ${localeFile}`, () => {
      // Arrange
      const englishTranslations = JSON.parse(
        readFileSync(join(englishDirectory, localeFile), 'utf8'),
      ) as unknown;
      const frenchTranslations = JSON.parse(
        readFileSync(join(frenchDirectory, localeFile), 'utf8'),
      ) as unknown;

      // Act
      const englishKeys = flattenTranslationKeys(englishTranslations).sort();
      const frenchKeys = flattenTranslationKeys(frenchTranslations).sort();

      // Assert
      expect(frenchKeys).toEqual(englishKeys);
    });
  }

  it('covers statically referenced backend translation keys', () => {
    // Arrange
    const sourceDirectory = join(process.cwd(), 'src');
    const englishKeys = localeFiles.flatMap((localeFile) => {
      const namespace = localeFile.replace(/\.json$/, '');
      const translations = JSON.parse(
        readFileSync(join(englishDirectory, localeFile), 'utf8'),
      ) as unknown;

      return flattenTranslationKeys(translations).map((key) => `${namespace}.${key}`);
    });
    const frenchKeys = localeFiles.flatMap((localeFile) => {
      const namespace = localeFile.replace(/\.json$/, '');
      const translations = JSON.parse(
        readFileSync(join(frenchDirectory, localeFile), 'utf8'),
      ) as unknown;

      return flattenTranslationKeys(translations).map((key) => `${namespace}.${key}`);
    });

    // Act
    const usedKeys = collectStaticBackendTranslationKeys(sourceDirectory, namespaces);

    // Assert
    expect(usedKeys.filter((key) => !englishKeys.includes(key))).toEqual([]);
    expect(usedKeys.filter((key) => !frenchKeys.includes(key))).toEqual([]);
  });

  it('does not keep stale backend translation keys', () => {
    // Arrange
    const sourceDirectory = join(process.cwd(), 'src');
    const englishKeys = localeFiles.flatMap((localeFile) => {
      const namespace = localeFile.replace(/\.json$/, '');
      const translations = JSON.parse(
        readFileSync(join(englishDirectory, localeFile), 'utf8'),
      ) as unknown;

      return flattenTranslationKeys(translations).map((key) => `${namespace}.${key}`);
    });

    // Act
    const usedKeys = collectStaticBackendTranslationKeys(sourceDirectory, namespaces);

    // Assert
    expect(englishKeys.filter((key) => !usedKeys.includes(key))).toEqual([]);
  });
});
