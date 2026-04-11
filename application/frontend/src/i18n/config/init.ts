import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TranslationResourceComposer } from '../translation-resource-composer';

export const LANGUAGE_STORAGE_KEY = 'pleey_language';

export enum SupportedLanguage {
  EN = 'en',
  FR = 'fr',
}

export class LanguagePreferenceResolver {
  resolve(): SupportedLanguage {
    if (typeof window === 'undefined') {
      return SupportedLanguage.EN;
    }

    const persisted = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (persisted === SupportedLanguage.FR || persisted === SupportedLanguage.EN) {
      return persisted;
    }

    return window.navigator.language.toLowerCase().startsWith(SupportedLanguage.FR)
      ? SupportedLanguage.FR
      : SupportedLanguage.EN;
  }
}

interface InitializeI18nDependencies {
  readonly languagePreferenceResolver: LanguagePreferenceResolver;
  readonly translationResourceComposer: TranslationResourceComposer;
}

export function initializeI18n({
  languagePreferenceResolver,
  translationResourceComposer,
}: InitializeI18nDependencies): void {
  if (i18n.isInitialized) {
    return;
  }

  i18n.use(initReactI18next).init({
    resources: translationResourceComposer.compose(),
    lng: languagePreferenceResolver.resolve(),
    fallbackLng: SupportedLanguage.EN,
    interpolation: {
      escapeValue: false,
    },
  });
}
