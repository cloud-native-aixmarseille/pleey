import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ArcadeBadge,
  Button,
  Card,
} from "../../../../presentation/shared/ui/components";
import type { GameSession } from "../../../../domains/game/types";
import type { Quiz } from "../../../../domains/quiz/types";

import {
  formatSessionDate,
  getSessionStatusTone,
} from "../shared/sessionUtils";

const SECTION_WRAPPER_CLASSES = "mb-6 animate-fade-in";
const SECTION_CONTENT_CLASSES = "flex flex-col gap-4";
const HEADER_WRAPPER_CLASSES = "mb-2 flex items-center gap-3";
const HEADER_ICON_CLASSES = "text-5xl";
const HEADER_TITLE_CLASSES =
  "text-lg font-semibold text-primary-900 dark:text-2xl dark:font-black dark:text-accent-200";
const HEADER_SUBTITLE_CLASSES = "text-dark-400 dark:text-light-400";

const EMPTY_CARD_WRAPPER_CLASSES =
  "rounded-[var(--arcade-radius-lg)] border border-dashed border-primary-500/35 bg-light-50/80 p-6 text-dark-500 shadow-inner dark:border-primary-500/50 dark:bg-dark-800/90 dark:text-light-300";
const EMPTY_CARD_CONTENT_CLASSES = "flex items-center gap-3";
const EMPTY_ICON_CLASSES = "text-2xl";
const EMPTY_TEXT_CLASSES = "text-base font-medium";

const LIST_WRAPPER_CLASSES = "space-y-4";
const SESSION_CARD_CLASSES =
  "transition-all focus-within:ring-2 focus-within:ring-primary-500/30 dark:focus-within:ring-accent-400/30";
const SESSION_CARD_CONTENT_CLASSES =
  "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between";
const SESSION_INFO_CLASSES = "flex-1 min-w-0";
const SESSION_BADGE_ROW_CLASSES = "flex flex-wrap items-center gap-3";
const LIVE_BADGE_CLASSES =
  "inline-flex items-center gap-2 rounded-full border border-primary-500/40 bg-primary-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-900 dark:border-primary-500/50 dark:bg-primary-500/25 dark:text-light-100";
const SESSION_TITLE_CLASSES =
  "mt-3 text-base font-medium text-dark-900 dark:text-lg dark:font-semibold dark:text-light-100";
const SESSION_META_CLASSES =
  "mt-3 flex flex-wrap items-center gap-3 text-sm text-dark-500 dark:text-light-300";
const SESSION_PIN_CLASSES =
  "flex items-center gap-2 font-mono text-accent-900 dark:text-accent-200";
const SESSION_PIN_VALUE_CLASSES = "text-lg font-semibold tabular-nums";
const SESSION_ACTIONS_CLASSES = "flex items-center gap-2";
const SR_ONLY_CLASSES = "sr-only";

interface AdminLiveSessionsSectionProps {
  sessions: GameSession[];
  quizLookup: Map<number, Quiz>;
  onJoinSession: (session: GameSession) => Promise<void> | void;
}

export function AdminLiveSessionsSection({
  sessions,
  quizLookup,
  onJoinSession,
}: AdminLiveSessionsSectionProps) {
  const { t } = useTranslation();
  const [joiningKey, setJoiningKey] = useState<string | null>(null);
  const liveStatuses = useMemo(
    () => new Set(["waiting", "active", "paused"]),
    []
  );

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((left, right) => {
      const leftDate = new Date(
        left.createdAt ?? left.created_at ?? 0
      ).getTime();
      const rightDate = new Date(
        right.createdAt ?? right.created_at ?? 0
      ).getTime();
      return rightDate - leftDate;
    });
  }, [sessions]);

  const liveSessions = useMemo(
    () => sortedSessions.filter((session) => liveStatuses.has(session.status)),
    [liveStatuses, sortedSessions]
  );

  const handleJoinSession = async (
    session: GameSession,
    sessionKey: string
  ) => {
    if (joiningKey) {
      return;
    }

    setJoiningKey(sessionKey);
    try {
      await Promise.resolve(onJoinSession(session));
    } finally {
      setJoiningKey(null);
    }
  };

  const renderHeader = () => (
    <header className={HEADER_WRAPPER_CLASSES}>
      <span aria-hidden="true" className={HEADER_ICON_CLASSES}>
        🕹️
      </span>
      <div>
        <h3 className={HEADER_TITLE_CLASSES}>{t("admin.liveSessionsTitle")}</h3>
        <p className={HEADER_SUBTITLE_CLASSES}>
          {t("admin.liveSessionsSubtitle")}
        </p>
      </div>
    </header>
  );

  if (liveSessions.length === 0) {
    return (
      <div className={SECTION_WRAPPER_CLASSES} data-live-sessions="empty">
        <Card
          padding="lg"
          border="thin"
          elevation="panel"
          surface="panel"
          motion="none"
        >
          <div className={SECTION_CONTENT_CLASSES}>
            {renderHeader()}
            <div className={EMPTY_CARD_WRAPPER_CLASSES}>
              <div className={EMPTY_CARD_CONTENT_CLASSES}>
                <span aria-hidden="true" className={EMPTY_ICON_CLASSES}>
                  🛰️
                </span>
                <p className={EMPTY_TEXT_CLASSES}>
                  {t("admin.noLiveSessions")}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={SECTION_WRAPPER_CLASSES} data-live-sessions="list">
      <Card
        padding="lg"
        border="thin"
        elevation="panel"
        surface="panel"
        motion="none"
      >
        <div className="flex flex-col gap-6">
          {renderHeader()}
          <div className={LIST_WRAPPER_CLASSES}>
            {liveSessions.map((session) => {
              const quizId = session.quizId ?? session.quiz_id;
              const relatedQuiz =
                typeof quizId === "number" ? quizLookup.get(quizId) : undefined;
              const createdAt = session.createdAt ?? session.created_at ?? null;
              const sessionKey = String(
                session.sessionId ??
                  session.pin ??
                  `${quizId ?? "unknown"}-${createdAt ?? Date.now()}`
              );
              const tone = getSessionStatusTone(session.status);
              const isJoining = joiningKey === sessionKey;

              return (
                <Card
                  key={sessionKey}
                  padding="md"
                  border="thin"
                  elevation="panel"
                  surface="panel"
                  motion="none"
                  className={SESSION_CARD_CLASSES}
                >
                  <div className={SESSION_CARD_CONTENT_CLASSES}>
                    <div className={SESSION_INFO_CLASSES}>
                      <div className={SESSION_BADGE_ROW_CLASSES}>
                        <span className={LIVE_BADGE_CLASSES}>
                          {t("admin.liveSessionBadge")}
                        </span>
                        <ArcadeBadge tone={tone} indicator pulse>
                          {t(`admin.sessionStatus.${session.status}`, {
                            defaultValue: session.status,
                          })}
                        </ArcadeBadge>
                      </div>
                      <h4 className={SESSION_TITLE_CLASSES}>
                        {relatedQuiz?.title ?? t("admin.unknownQuiz")}
                      </h4>
                      <div className={SESSION_META_CLASSES}>
                        <span className={SESSION_PIN_CLASSES}>
                          <span className={SR_ONLY_CLASSES}>
                            {t("admin.sessionPinLabel", { pin: session.pin })}
                          </span>
                          <span aria-hidden="true">PIN</span>
                          <span
                            aria-hidden="true"
                            className={SESSION_PIN_VALUE_CLASSES}
                          >
                            {session.pin}
                          </span>
                        </span>
                        <span>
                          {t("admin.sessionStartedLabel", {
                            date: formatSessionDate(createdAt),
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={SESSION_ACTIONS_CLASSES}>
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleJoinSession(session, sessionKey)}
                        disabled={isJoining}
                        aria-label={t("admin.joinSessionButtonAria", {
                          pin: session.pin,
                        })}
                      >
                        {isJoining
                          ? t("common.loading")
                          : t("admin.joinSessionButton")}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
