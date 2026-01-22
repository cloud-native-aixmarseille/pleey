import type { ChangeEvent } from "react";
import type { Question } from "../../../../../domains/quiz/types";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "../../../../../domains/quiz/quiz.payloads";

export type OptionKey = "A" | "B" | "C" | "D";
export type QuestionType = "multiple" | "truefalse";

const MULTIPLE_OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];

function getOptionKeyByPosition(position: number): OptionKey | null {
  return MULTIPLE_OPTION_KEYS[position] ?? null;
}

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

export function buildFormStateFromQuestion(question: Question): QuestionFormState {
  if (question.type === "multiple") {
    const optionMap = question.answers.reduce<Record<OptionKey, string>>(
      (accumulator, answer) => {
        const key = getOptionKeyByPosition(answer.position);
        if (key && key in accumulator) {
          accumulator[key] = answer.text ?? "";
        }
        return accumulator;
      },
      createEmptyOptions()
    );
    const correctAnswerValue =
      getOptionKeyByPosition(
        question.answers.find((answer) => answer.isCorrect)?.position ?? 0
      ) ?? "A";

    return {
      questionText: question.questionText,
      type: "multiple",
      options: optionMap,
      correctAnswer: correctAnswerValue,
      timeLimit: question.timeLimit,
      points: question.points,
    };
  }

  const correctAnswerValue =
    question.answers.find((answer) => answer.isCorrect)?.position ?? 0;

  return {
    questionText: question.questionText,
    type: "truefalse",
    options: createEmptyOptions(),
    correctAnswer: correctAnswerValue === 1 ? "false" : "true",
    timeLimit: question.timeLimit,
    points: question.points,
  };
}

export function toCreatePayload(
  form: QuestionFormState,
  quizId: number
): CreateQuestionPayload {
  const base = toPayloadBase(form);

  if (form.type === "multiple") {
    return {
      quizId,
      ...base,
      answers: toAnswers(form),
    };
  }

  return {
    quizId,
    ...base,
    answers: toAnswers(form),
  };
}

export function toUpdatePayload(form: QuestionFormState): UpdateQuestionPayload {
  const base = toPayloadBase(form);

  return {
    ...base,
    answers: toAnswers(form),
  };
}

export function handleNumericFieldChange(
  event: ChangeEvent<HTMLInputElement>,
  fallback: number
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
    {} as Record<OptionKey, string | null>
  );
}

function toAnswers(form: QuestionFormState) {
  if (form.type === "truefalse") {
    return [
      {
        text: null,
        position: 0,
        isCorrect: form.correctAnswer !== "false",
      },
      {
        text: null,
        position: 1,
        isCorrect: form.correctAnswer === "false",
      },
    ];
  }

  const sanitized = sanitizeOptions(form.options);

  return (Object.keys(sanitized) as OptionKey[])
    .filter((key) => Boolean(sanitized[key]?.trim()))
    .map((key) => ({
      text: sanitized[key]?.trim() ?? null,
      position: MULTIPLE_OPTION_KEYS.indexOf(key),
      isCorrect: form.correctAnswer === key,
    }));
}

function toPayloadBase(form: QuestionFormState) {
  return {
    questionText: form.questionText.trim(),
    type: form.type,
    timeLimit: form.timeLimit,
    points: form.points,
  } satisfies Pick<CreateQuestionPayload, "questionText" | "type" | "timeLimit" | "points">;
}
