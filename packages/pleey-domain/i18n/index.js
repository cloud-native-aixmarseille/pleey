import { PredictionErrorCode, QuizErrorCode } from '../errors/index.js';
import { en } from './en.js';
import { fr } from './fr.js';

export const SHARED_ERROR_TRANSLATION_KEYS = {
  [QuizErrorCode.QUIZ_NOT_FOUND]: 'quiz.errors.quizNotFound',
  [QuizErrorCode.QUESTION_NOT_FOUND]: 'quiz.errors.questionNotFound',
  [QuizErrorCode.QUIZ_HAS_ACTIVE_PARTY]: 'quiz.errors.quizHasActiveParty',
  [QuizErrorCode.INVALID_CORRECT_ANSWER]: 'quiz.errors.invalidCorrectAnswer',
  [QuizErrorCode.CORRECT_ANSWER_OPTION_EMPTY]: 'quiz.errors.correctAnswerOptionEmpty',
  [QuizErrorCode.INVALID_QUESTION_MEDIA]: 'quiz.errors.invalidQuestionMedia',
  [QuizErrorCode.QUIZ_IMPORT_INVALID_FILE]: 'quiz.errors.importInvalidFile',
  [QuizErrorCode.QUIZ_IMPORT_UNSUPPORTED_FORMAT]: 'quiz.errors.importUnsupportedFormat',
  [QuizErrorCode.QUIZ_IMPORT_EMPTY_FILE]: 'quiz.errors.importEmptyFile',
  [PredictionErrorCode.PREDICTION_NOT_FOUND]: 'prediction.errors.predictionNotFound',
  [PredictionErrorCode.PROMPT_NOT_FOUND]: 'prediction.errors.promptNotFound',
  [PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY]: 'prediction.errors.predictionHasActiveParty',
  [PredictionErrorCode.INVALID_CORRECT_OPTION]: 'prediction.errors.invalidCorrectOption',
  [PredictionErrorCode.OPTION_TEXT_EMPTY]: 'prediction.errors.optionTextEmpty',
  [PredictionErrorCode.PREDICTION_IMPORT_INVALID_FILE]: 'prediction.errors.importInvalidFile',
  [PredictionErrorCode.PREDICTION_IMPORT_UNSUPPORTED_FORMAT]: 'prediction.errors.importUnsupportedFormat',
  [PredictionErrorCode.PREDICTION_IMPORT_EMPTY_FILE]: 'prediction.errors.importEmptyFile',
};

export const SHARED_TRANSLATIONS = {
  en,
  fr,
};
