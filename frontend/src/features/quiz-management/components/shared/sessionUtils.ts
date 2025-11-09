import type { GameSession } from "../../../../shared/types";
import type { ArcadeBadgeTone } from "../../../../shared/ui/components";

interface FormatSessionDateOptions {
  fallback?: string;
  preserveInvalid?: boolean;
}

const STATUS_TONE_MAP: Partial<Record<GameSession["status"], ArcadeBadgeTone>> = {
  active: "success",
  waiting: "accent",
  paused: "secondary",
  completed: "neutral",
};

export function getSessionStatusTone(
  status: GameSession["status"],
  fallback: ArcadeBadgeTone = "neutral"
): ArcadeBadgeTone {
  return STATUS_TONE_MAP[status] ?? fallback;
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
