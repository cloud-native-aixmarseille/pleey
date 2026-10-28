import { createInstance } from 'i18next';
import type { TranslationPort } from '../../application/shared/ports/translation.port';
import { TranslationResourceComposer } from '../../i18n/translation-resource-composer';

export class TranslationFixtureFactory {
  async create(language = 'en'): Promise<TranslationPort> {
    const i18n = createInstance();
    await i18n.init({ lng: language, fallbackLng: 'en', resources: new TranslationResourceComposer().compose() });
    return {
      currentLanguage: language,
      changeLanguage: (next) => {
        void i18n.changeLanguage(next);
      },
      t: (key, variables) => i18n.t(key, variables),
    };
  }
}
