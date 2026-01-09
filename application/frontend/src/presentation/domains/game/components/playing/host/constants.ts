export const ANSWER_OPTION_KEYS = ["A", "B", "C", "D"] as const;

export type AnswerOptionKey = (typeof ANSWER_OPTION_KEYS)[number];

export const MIN_DISPLAY_PERCENTAGE = 5;
