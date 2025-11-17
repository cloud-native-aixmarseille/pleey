export const LOW_TIME_THRESHOLD = 5;
export const MEDIUM_TIME_THRESHOLD = 10;
export const MIN_DISPLAY_PERCENTAGE = 5;

export const ANSWER_OPTION_KEYS = ["A", "B", "C", "D"] as const;

export type AnswerOptionKey = (typeof ANSWER_OPTION_KEYS)[number];
export type TimerUrgency = "high" | "medium" | "low";

export function determineTimerUrgency(timeLeft: number): TimerUrgency {
  if (timeLeft <= LOW_TIME_THRESHOLD) {
    return "low";
  }

  if (timeLeft <= MEDIUM_TIME_THRESHOLD) {
    return "medium";
  }

  return "high";
}

export function calculateProgressPercentage(
  timeLeft: number,
  timeLimit: number
): number {
  if (timeLimit <= 0) {
    return 0;
  }

  const ratio = (timeLeft / timeLimit) * 100;
  return Math.min(100, Math.max(0, ratio));
}
