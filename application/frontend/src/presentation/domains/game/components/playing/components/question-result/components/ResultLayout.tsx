import { ReactNode } from "react";

import { composeClasses } from "../../../../../../../shared/utils/composeClasses";

const BASE_CONTAINER_CLASSES = composeClasses(
  "relative overflow-hidden rounded-[var(--arcade-radius-xl)]",
  "border-2 border-white/15 text-white shadow-[0_25px_50px_rgba(0,0,0,0.35)]",
  "animate-scale-in"
);

const VARIANT_CLASS_MAP: Record<"correct" | "incorrect", string> = {
  correct: "bg-gradient-to-br from-success-500 via-accent-500/80 to-accent-500",
  incorrect:
    "bg-gradient-to-br from-danger-500 via-secondary-500/80 to-secondary-500",
};

const CONTENT_CLASSES = "relative z-10 p-8 sm:p-12";
const OVERLAY_CLASSES =
  "pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-float";
const SCREEN_READER_CLASSES = "sr-only";

interface ResultLayoutProps {
  isCorrect: boolean;
  announcement: string;
  statisticsAnnouncement?: string;
  children: ReactNode;
}

export function ResultLayout({
  isCorrect,
  announcement,
  statisticsAnnouncement,
  children,
}: ResultLayoutProps) {
  const containerClasses = composeClasses(
    BASE_CONTAINER_CLASSES,
    VARIANT_CLASS_MAP[isCorrect ? "correct" : "incorrect"]
  );

  return (
    <section className={containerClasses} data-result-layout="true">
      <ScreenReaderAnnouncement
        announcement={announcement}
        statisticsAnnouncement={statisticsAnnouncement}
      />

      <div
        className={OVERLAY_CLASSES}
        style={{ animationDuration: "2s" }}
        aria-hidden="true"
      />

      <div className={CONTENT_CLASSES}>{children}</div>
    </section>
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
      className={SCREEN_READER_CLASSES}
    >
      {announcement}
      {statisticsAnnouncement ? ` ${statisticsAnnouncement}` : null}
    </div>
  );
}
