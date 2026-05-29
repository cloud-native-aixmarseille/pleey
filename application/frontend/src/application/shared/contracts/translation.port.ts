export interface TranslationVariables {
  readonly [name: string]: string;
}

export interface TranslationPort {
  readonly currentLanguage: string;
  changeLanguage(language: string): void;
  t(key: string, variables?: TranslationVariables): string;
}

export const TranslationPortToken = Symbol.for('TranslationPort');
