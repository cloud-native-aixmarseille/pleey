import { gameEn } from '../presentation/game-session/live/shared/i18n/en';
import { gameFr } from '../presentation/game-session/live/shared/i18n/fr';
import { homeEn } from '../presentation/home/i18n/en';
import { homeFr } from '../presentation/home/i18n/fr';
import { authEn } from '../presentation/identity/i18n/en';
import { authFr } from '../presentation/identity/i18n/fr';
import { notFoundEn } from '../presentation/not-found/i18n/en';
import { notFoundFr } from '../presentation/not-found/i18n/fr';
import { predictionEn } from '../presentation/prediction/i18n/en';
import { predictionFr } from '../presentation/prediction/i18n/fr';
import { quizEn } from '../presentation/quiz/i18n/en';
import { quizFr } from '../presentation/quiz/i18n/fr';
import { sharedEn } from '../presentation/shared/i18n/en';
import { sharedFr } from '../presentation/shared/i18n/fr';
import { dashboardEn } from '../presentation/workspace/dashboard/i18n/en';
import { dashboardFr } from '../presentation/workspace/dashboard/i18n/fr';
import { organizationEn } from '../presentation/workspace/organizations/i18n/en';
import { organizationFr } from '../presentation/workspace/organizations/i18n/fr';

type TranslationRecord = Record<string, unknown>;

export class TranslationResourceComposer {
  compose() {
    return {
      en: {
        translation: this.merge(
          sharedEn,
          homeEn,
          notFoundEn,
          authEn,
          dashboardEn,
          organizationEn,
          quizEn,
          predictionEn,
          gameEn,
        ),
      },
      fr: {
        translation: this.merge(
          sharedFr,
          homeFr,
          notFoundFr,
          authFr,
          dashboardFr,
          organizationFr,
          quizFr,
          predictionFr,
          gameFr,
        ),
      },
    };
  }

  private merge(...records: TranslationRecord[]): TranslationRecord {
    return records.reduce<TranslationRecord>((accumulator, record) => {
      return this.mergeRecord(accumulator, record);
    }, {});
  }

  private mergeRecord(base: TranslationRecord, extension: TranslationRecord): TranslationRecord {
    const result = { ...base };

    for (const [key, value] of Object.entries(extension)) {
      const current = result[key];

      if (this.isObject(current) && this.isObject(value)) {
        result[key] = this.mergeRecord(current, value);
        continue;
      }

      result[key] = value;
    }

    return result;
  }

  private isObject(value: unknown): value is TranslationRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
