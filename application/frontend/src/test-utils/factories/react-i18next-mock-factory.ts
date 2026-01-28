import type { TranslationVariables } from '../../application/shared/contracts/translation.port';

export class ReactI18nextMockFactory {
  createModule() {
    return {
      initReactI18next: { type: '3rdParty', init: () => {} },
      useTranslation: () => ({
        t: (key: string, variables?: TranslationVariables) =>
          this.createTranslation(key, variables),
        i18n: {
          language: 'en',
          changeLanguage: () => Promise.resolve(),
        },
      }),
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
