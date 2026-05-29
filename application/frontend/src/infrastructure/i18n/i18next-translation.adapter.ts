import i18next, { type i18n as I18n } from 'i18next';
import { injectable } from 'inversify';
import { getI18n } from 'react-i18next';
import type {
  TranslationPort,
  TranslationVariables,
} from '../../application/shared/contracts/translation.port';

@injectable()
export class I18nextTranslationAdapter implements TranslationPort {
  private get i18n(): I18n {
    return getI18n() ?? i18next;
  }

  get currentLanguage(): string {
    return this.i18n.language;
  }

  changeLanguage(language: string): void {
    void this.i18n.changeLanguage(language);
  }

  t(key: string, variables?: TranslationVariables): string {
    return this.i18n.t(key, variables);
  }
}
