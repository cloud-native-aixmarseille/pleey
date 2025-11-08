import type { GameSession } from "../../../../shared/types";

const STATUS_TONES: Record<string, string> = {
  active: "bg-success-100/80 text-success-700 border border-success-500/30",
  waiting: "bg-warning-100/80 text-warning-700 border border-warning-500/30",
  paused: "bg-secondary-100/60 text-secondary-700 border border-secondary-400/30",
  completed: "bg-dark-500/50 text-light-300 border border-dark-400/30",
};

const DEFAULT_TONE = "bg-dark-500/60 text-light-200 border border-dark-400/30";

interface FormatSessionDateOptions {
  fallback?: string;
  preserveInvalid?: boolean;
}

export function getSessionStatusTone(status: GameSession["status"], fallback?: string) {
  return STATUS_TONES[status] ?? fallback ?? DEFAULT_TONE;
}

export function formatSessionDate(
  value?: string | null,
  options: FormatSessionDateOptions = {}
) {
  const { fallback = "-", preserveInvalid = true } = options;

  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return preserveInvalid ? value : fallback;
  }

  return date.toLocaleString();
}
