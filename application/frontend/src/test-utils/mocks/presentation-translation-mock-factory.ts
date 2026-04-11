import type { TranslationVariables } from '../../application/shared/contracts/translation.port';

interface PresentationTranslationMockValue {
  readonly currentLanguage: string;
  readonly changeLanguage: (language: string) => void | Promise<void>;
  readonly t: (key: string, variables?: TranslationVariables) => unknown;
}

export class PresentationTranslationMockFactory {
  createValue(
    overrides: Partial<PresentationTranslationMockValue> = {},
  ): PresentationTranslationMockValue {
    return {
      currentLanguage: 'en',
      changeLanguage: () => {},
      t: (key: string, variables?: TranslationVariables) => this.createTranslation(key, variables),
      ...overrides,
    };
  }

  createModule(overrides: Partial<PresentationTranslationMockValue> = {}) {
    const value = this.createValue(overrides);

    return {
      usePresentationTranslation: () => value,
    };
  }

  async createPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: Partial<PresentationTranslationMockValue> = {},
  ): Promise<TModule & ReturnType<PresentationTranslationMockFactory['createModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createModule(overrides),
    };
  }

  private createTranslation(key: string, variables?: TranslationVariables): string {
    if (!variables) {
      return key;
    }

    const renderedVariables = Object.entries(variables)
      .map(([name, value]) => `${name}=${value}`)
      .join(', ');

    return `${key} (${renderedVariables})`;
  }
}
