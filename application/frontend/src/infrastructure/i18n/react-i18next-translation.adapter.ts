import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TranslationPort } from '../../application/shared/contracts/translation.port';
import type { StoragePort } from '../../domains/shared/ports/storage.port';
import { LANGUAGE_STORAGE_KEY } from '../../i18n/config/init';

export function useReactI18nextTranslationAdapter(storage: StoragePort): TranslationPort {
  const { t, i18n } = useTranslation();

  const changeLanguage = useCallback(
    (language: string) => {
      i18n.changeLanguage(language);
      storage.setItem(LANGUAGE_STORAGE_KEY, language);
    },
    [i18n, storage],
  );

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    t: (key, variables) => t(key, variables),
  };
}
