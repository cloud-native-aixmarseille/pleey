import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TranslationResourceComposer } from './translation-resource-composer';

const translationResourceComposer = new TranslationResourceComposer();

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

function collectFrontendTranslationReferences(directory: string): {
  exactKeys: string[];
  rootedKeys: string[];
  translationNamespaces: string[];
} {
  const directTranslationKeyPatterns = [
    /\bt\(\s*['"]([^'"]+)['"]/g,
    /\bi18n\.t\(\s*['"]([^'"]+)['"]/g,
    /\btranslate\(\s*['"]([^'"]+)['"]/g,
  ];
  const returnObjectRootPatterns = [
    /\bt\(\s*['"]([^'"]+)['"]\s*,\s*\{[^}]*returnObjects\s*:\s*true/gs,
    /\bi18n\.t\(\s*['"]([^'"]+)['"]\s*,\s*\{[^}]*returnObjects\s*:\s*true/gs,
  ];
  const quotedTranslationKeyPattern = /['"]([a-z]+(?:\.[A-Za-z0-9_[\]]+)+)['"]/g;
  const templateLiteralRootPattern = /`([a-z]+(?:\.[A-Za-z0-9_]+)*\.)\$\{/g;
  const resources = translationResourceComposer.compose();
  const translationNamespaces = Object.keys(resources.en.translation as Record<string, unknown>);
  const isTranslationKey = (candidate: string) => {
    return translationNamespaces.some(
      (namespace) => candidate === namespace || candidate.startsWith(`${namespace}.`),
    );
  };
  const exactKeys = new Set<string>();
  const rootedKeys = new Set<string>();

  for (const filePath of listSourceFiles(directory)) {
    if (/\.(test|spec)\.(ts|tsx)$/.test(filePath)) {
      continue;
    }

    const fileContent = readFileSync(filePath, 'utf8');

    for (const pattern of directTranslationKeyPatterns) {
      pattern.lastIndex = 0;

      for (const match of fileContent.matchAll(pattern)) {
        if (isTranslationKey(match[1])) {
          exactKeys.add(match[1]);
        }
      }
    }

    for (const pattern of returnObjectRootPatterns) {
      pattern.lastIndex = 0;

      for (const match of fileContent.matchAll(pattern)) {
        if (isTranslationKey(match[1])) {
          rootedKeys.add(match[1]);
        }
      }
    }

    quotedTranslationKeyPattern.lastIndex = 0;
    for (const match of fileContent.matchAll(quotedTranslationKeyPattern)) {
      if (isTranslationKey(match[1])) {
        exactKeys.add(match[1]);
      }
    }

    templateLiteralRootPattern.lastIndex = 0;
    for (const match of fileContent.matchAll(templateLiteralRootPattern)) {
      const candidate = match[1].replace(/\.$/, '');
      if (isTranslationKey(candidate)) {
        rootedKeys.add(candidate);
      }
    }
  }

  const rootKeysFromExactMatches = [...exactKeys].filter((key) => {
    return [...exactKeys].some((otherKey) => otherKey !== key && otherKey.startsWith(`${key}.`));
  });

  return {
    exactKeys: [...exactKeys].sort(),
    rootedKeys: [...new Set([...rootedKeys, ...rootKeysFromExactMatches])].sort(),
    translationNamespaces,
  };
}

function isCoveredByRoot(key: string, rootedKeys: string[]): boolean {
  return rootedKeys.some((root) => {
    return key === root || key.startsWith(`${root}.`) || key.startsWith(`${root}[`);
  });
}

function collectDefinedReferenceRoots(exactKeys: string[], definedKeys: string[]): string[] {
  return exactKeys.filter((key) => {
    return definedKeys.some((definedKey) => {
      return definedKey.startsWith(`${key}.`) || definedKey.startsWith(`${key}[`);
    });
  });
}

describe('TranslationResourceComposer', () => {
  describe('compose()', () => {
    it('returns resources for the en locale', () => {
      // Act
      const resources = translationResourceComposer.compose();

      // Assert
      expect(resources).toHaveProperty('en.translation');
    });

    it('returns resources for the fr locale', () => {
      // Act
      const resources = translationResourceComposer.compose();

      // Assert
      expect(resources).toHaveProperty('fr.translation');
    });

    it('merges shared namespace keys into the translation object', () => {
      // Act
      const { en } = translationResourceComposer.compose();

      // Assert - shared.shell.* keys come from the shared i18n module
      expect(en.translation).toHaveProperty('shared');
    });

    it('merges auth namespace keys into the translation object', () => {
      // Act
      const { en } = translationResourceComposer.compose();

      // Assert
      expect(en.translation).toHaveProperty('auth');
    });

    it('merges dashboard namespace keys into the translation object', () => {
      // Act
      const { en } = translationResourceComposer.compose();

      // Assert
      expect(en.translation).toHaveProperty('dashboard');
    });

    it('merges game namespace keys into the translation object', () => {
      // Act
      const { en } = translationResourceComposer.compose();

      // Assert
      expect(en.translation).toHaveProperty('game');
    });

    it('deeply merges overlapping top-level sections without losing sibling keys', () => {
      // Act
      const { en } = translationResourceComposer.compose();
      const translation = en.translation as Record<string, unknown>;

      // Assert - both shared and auth top-level keys co-exist
      expect(translation).toHaveProperty('shared');
      expect(translation).toHaveProperty('auth');
      expect(translation).toHaveProperty('dashboard');
      expect(translation).toHaveProperty('game');
    });

    it('keeps english and french translation keys aligned', () => {
      // Act
      const resources = translationResourceComposer.compose();
      const englishKeys = flattenTranslationKeys(resources.en.translation).sort();
      const frenchKeys = flattenTranslationKeys(resources.fr.translation).sort();

      // Assert
      expect(frenchKeys).toEqual(englishKeys);
    });

    it('covers statically referenced translation keys across the frontend source tree', () => {
      const sourceDirectory = join(process.cwd(), 'src');

      // Act
      const resources = translationResourceComposer.compose();
      const englishTranslationKeys = flattenTranslationKeys(resources.en.translation).sort();
      const frenchTranslationKeys = flattenTranslationKeys(resources.fr.translation).sort();
      const englishKeys = new Set(englishTranslationKeys);
      const frenchKeys = new Set(frenchTranslationKeys);
      const { exactKeys, rootedKeys } = collectFrontendTranslationReferences(sourceDirectory);
      const effectiveEnglishRoots = [
        ...rootedKeys,
        ...collectDefinedReferenceRoots(exactKeys, englishTranslationKeys),
      ];
      const effectiveFrenchRoots = [
        ...rootedKeys,
        ...collectDefinedReferenceRoots(exactKeys, frenchTranslationKeys),
      ];

      // Assert
      expect(
        exactKeys.filter(
          (key) => !englishKeys.has(key) && !isCoveredByRoot(key, effectiveEnglishRoots),
        ),
      ).toEqual([]);
      expect(
        exactKeys.filter(
          (key) => !frenchKeys.has(key) && !isCoveredByRoot(key, effectiveFrenchRoots),
        ),
      ).toEqual([]);
    });

    it('does not keep stale translation keys in the frontend resources', () => {
      const sourceDirectory = join(process.cwd(), 'src');

      // Act
      const resources = translationResourceComposer.compose();
      const englishKeys = flattenTranslationKeys(resources.en.translation).sort();
      const { exactKeys, rootedKeys } = collectFrontendTranslationReferences(sourceDirectory);
      const effectiveRoots = [
        ...rootedKeys,
        ...collectDefinedReferenceRoots(exactKeys, englishKeys),
      ];

      // Assert
      expect(
        englishKeys.filter(
          (key) => !exactKeys.includes(key) && !isCoveredByRoot(key, effectiveRoots),
        ),
      ).toEqual([]);
    });
  });
});
