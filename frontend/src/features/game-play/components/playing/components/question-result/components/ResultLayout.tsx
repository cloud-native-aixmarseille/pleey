import { ReactNode } from "react";

import { Card } from "../../../../../../../shared/components";

interface ResultLayoutProps {
  isCorrect: boolean;
  announcement: string;
  statisticsAnnouncement?: string;
  children: ReactNode;
}

const CORRECT_GRADIENT = "bg-gradient-to-br from-success-500 to-accent-500";
const INCORRECT_GRADIENT = "bg-gradient-to-br from-danger-500 to-secondary-500";

export function ResultLayout({
  isCorrect,
  announcement,
  statisticsAnnouncement,
  children,
}: ResultLayoutProps) {
  const gradientClass = isCorrect ? CORRECT_GRADIENT : INCORRECT_GRADIENT;

  return (
    <Card
      className={`p-8 sm:p-12 text-white animate-scale-in relative overflow-hidden ${gradientClass}`}
    >
      <ScreenReaderAnnouncement
        announcement={announcement}
        statisticsAnnouncement={statisticsAnnouncement}
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-float"
        style={{ animationDuration: "2s" }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
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
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
      {statisticsAnnouncement ? ` ${statisticsAnnouncement}` : null}
    </div>
  );
}
