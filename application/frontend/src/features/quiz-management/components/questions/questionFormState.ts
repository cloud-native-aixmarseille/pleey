import type { ChangeEvent } from "react";
import type { Question } from "../../../../shared/types";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../../domains/quiz/quiz.service";

export type OptionKey = "A" | "B" | "C" | "D";
export type QuestionType = "multiple" | "truefalse";

export interface QuestionFormState {
  questionText: string;
  type: QuestionType;
  options: Record<OptionKey, string>;
  correctAnswer: string;
  timeLimit: number;
  points: number;
}

export const DEFAULT_TIME_LIMIT = 20;
export const DEFAULT_POINTS = 1000;

export function createEmptyOptions(): Record<OptionKey, string> {
  return {
    A: "",
    B: "",
    C: "",
    D: "",
  };
}

export function createDefaultQuestionFormState(): QuestionFormState {
  return {
    questionText: "",
    type: "multiple",
    options: createEmptyOptions(),
    correctAnswer: "A",
    timeLimit: DEFAULT_TIME_LIMIT,
    points: DEFAULT_POINTS,
  };
}

export function buildFormStateFromQuestion(
  question: Question,
): QuestionFormState {
  if (question.type === "multiple") {
    return {
      questionText: question.question_text,
      type: "multiple",
      options: {
        A: question.option_a ?? "",
        B: question.option_b ?? "",
        C: question.option_c ?? "",
        D: question.option_d ?? "",
      },
      correctAnswer: question.correct_answer,
      timeLimit: question.time_limit,
      points: question.points,
    };
  }

  return {
    questionText: question.question_text,
    type: "truefalse",
    options: createEmptyOptions(),
    correctAnswer: question.correct_answer === "false" ? "false" : "true",
    timeLimit: question.time_limit,
    points: question.points,
  };
}

export function toCreatePayload(
  form: QuestionFormState,
  quizId: number,
): CreateQuestionPayload {
  const base = toPayloadBase(form);

  if (form.type === "multiple") {
    const sanitized = sanitizeOptions(form.options);
    return {
      quizId,
      ...base,
      correctAnswer: form.correctAnswer,
      optionA: sanitized.A,
      optionB: sanitized.B,
      optionC: sanitized.C,
      optionD: sanitized.D,
    };
  }

  return {
    quizId,
    ...base,
    correctAnswer: form.correctAnswer === "false" ? "false" : "true",
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
  };
}

export function toUpdatePayload(
  form: QuestionFormState,
): UpdateQuestionPayload {
  const base = toPayloadBase(form);

  if (form.type === "multiple") {
    const sanitized = sanitizeOptions(form.options);
    return {
      ...base,
      correctAnswer: form.correctAnswer,
      optionA: sanitized.A,
      optionB: sanitized.B,
      optionC: sanitized.C,
      optionD: sanitized.D,
    };
  }

  return {
    ...base,
    correctAnswer: form.correctAnswer === "false" ? "false" : "true",
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
  };
}

export function handleNumericFieldChange(
  event: ChangeEvent<HTMLInputElement>,
  fallback: number,
) {
  const value = Number(event.target.value);
  return Number.isNaN(value) ? fallback : value;
}

function sanitizeOptions(options: Record<OptionKey, string>) {
  return (Object.keys(options) as OptionKey[]).reduce(
    (accumulator, key) => ({
      ...accumulator,
      [key]: options[key].trim() || null,
    }),
    {} as Record<OptionKey, string | null>,
  );
}

function toPayloadBase(form: QuestionFormState) {
  return {
    questionText: form.questionText.trim(),
    type: form.type,
    timeLimit: form.timeLimit,
    points: form.points,
  } satisfies Pick<
    CreateQuestionPayload,
    "questionText" | "type" | "timeLimit" | "points"
  >;
}
