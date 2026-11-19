import type { PredictionErrorCode, QuizErrorCode } from '../errors/index.js';

export type SharedBusinessErrorCode = QuizErrorCode | PredictionErrorCode;

export type SharedTranslationResources = {
  readonly quiz: {
    readonly errors: Readonly<Record<string, string>>;
  };
  readonly prediction: {
    readonly errors: Readonly<Record<string, string>>;
  };
};

export const SHARED_ERROR_TRANSLATION_KEYS: Readonly<Record<SharedBusinessErrorCode, string>>;
export const SHARED_TRANSLATIONS: Readonly<Record<'en' | 'fr', SharedTranslationResources>>;
