import { PredictionErrorCode, QuizErrorCode } from '../errors/index.js';

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
  en: {
    quiz: {
      errors: {
        quizNotFound: 'Quiz not found',
        questionNotFound: 'Question not found',
        quizHasActiveParty: "You can't delete this quiz while a party is active",
        invalidCorrectAnswer: 'Invalid correct answer value',
        correctAnswerOptionEmpty: 'The selected correct answer option cannot be empty',
        invalidQuestionMedia: 'This question media file is invalid',
        importInvalidFile: 'This quiz import file could not be parsed',
        importUnsupportedFormat: 'This quiz import format is not supported',
        importEmptyFile: 'No quiz questions were found in this import file',
      },
    },
    prediction: {
      errors: {
        predictionNotFound: 'Prediction not found',
        promptNotFound: 'Prediction prompt not found',
        predictionHasActiveParty: "You can't delete this prediction while a party is active",
        invalidCorrectOption: 'Invalid correct option value',
        optionTextEmpty: 'Option text is required',
        importInvalidFile: 'This prediction import file could not be parsed',
        importUnsupportedFormat: 'This prediction import format is not supported',
        importEmptyFile: 'No prediction prompts were found in this import file',
      },
    },
  },
  fr: {
    quiz: {
      errors: {
        quizNotFound: 'Quiz introuvable',
        questionNotFound: 'Question introuvable',
        quizHasActiveParty: "Impossible de supprimer ce quiz tant qu'une partie est en cours",
        invalidCorrectAnswer: 'La bonne réponse sélectionnée est invalide',
        correctAnswerOptionEmpty: "L'option choisie comme bonne réponse ne peut pas être vide",
        invalidQuestionMedia: 'Ce fichier média de question est invalide',
        importInvalidFile: "Ce fichier d'import de quiz n'a pas pu être analysé",
        importUnsupportedFormat: "Ce format de fichier de quiz n'est pas pris en charge",
        importEmptyFile: "Aucune question n'a été trouvée dans ce fichier d'import",
      },
    },
    prediction: {
      errors: {
        predictionNotFound: 'Pronostic introuvable',
        promptNotFound: 'Question de pronostic introuvable',
        predictionHasActiveParty: "Impossible de supprimer ce pronostic tant qu'une partie est en cours",
        invalidCorrectOption: "L'issue résolue sélectionnée est invalide",
        optionTextEmpty: "Le texte de l'option ne peut pas être vide",
        importInvalidFile: "Ce fichier d'import de pronostic n'a pas pu être analysé",
        importUnsupportedFormat: "Ce format de fichier de pronostic n'est pas pris en charge",
        importEmptyFile: "Aucun pronostic n'a été trouvé dans ce fichier d'import",
      },
    },
  },
};
