import { ReactNode } from "react";

import { Card } from "../../../../../../../shared/components";
import {
  createStyles,
  type StyleEntry,
} from "../../../../../../../shared/ui/styles";

const CARD_BASE_CLASSES =
  "p-8 sm:p-12 text-white animate-scale-in relative overflow-hidden";

const styles = createStyles("ResultLayout", {
  slot1:
    "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-float",
  slot2: "relative z-10",
  slot3: "sr-only",
  cardCorrect: `${CARD_BASE_CLASSES} bg-gradient-to-br from-success-500 to-accent-500`,
  cardIncorrect: `${CARD_BASE_CLASSES} bg-gradient-to-br from-danger-500 to-secondary-500`,
});

interface ResultLayoutProps {
  isCorrect: boolean;
  announcement: string;
  statisticsAnnouncement?: string;
  children: ReactNode;
}

const CARD_VARIANTS: Record<"correct" | "incorrect", StyleEntry> = {
  correct: styles.cardCorrect,
  incorrect: styles.cardIncorrect,
};

export function ResultLayout({
  isCorrect,
  announcement,
  statisticsAnnouncement,
  children,
}: ResultLayoutProps) {
  const cardVariant = CARD_VARIANTS[isCorrect ? "correct" : "incorrect"];

  return (
    <Card {...cardVariant}>
      <ScreenReaderAnnouncement
        announcement={announcement}
        statisticsAnnouncement={statisticsAnnouncement}
      />

      <div
        {...styles.slot1}
        style={{ animationDuration: "2s" }}
        aria-hidden="true"
      />

      <div {...styles.slot2}>{children}</div>
    </Card>
  );
}

interface ScreenReaderAnnouncementProps {
  announcement: string;
  statisticsAnnouncement?: string;
}

function ScreenReaderAnnouncement({
  announcement,
  statisticsAnnouncement,
}: ScreenReaderAnnouncementProps) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" {...styles.slot3}>
      {announcement}
      {statisticsAnnouncement ? ` ${statisticsAnnouncement}` : null}
    </div>
  );
}
