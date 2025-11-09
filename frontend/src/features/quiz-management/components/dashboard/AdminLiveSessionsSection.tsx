import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArcadeBadge, Button, Card } from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import {
  formatSessionDate,
  getSessionStatusTone,
} from "../shared/sessionUtils";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("AdminLiveSessionsSection", {
  slot1:
    "p-6 sm:p-8 mb-6 animate-fade-in bg-dark-700/80 border border-primary-500/30 shadow-xl",
  slot2: "flex flex-col gap-4",
  slot3: "flex items-center gap-3 mb-2",
  slot4: "text-5xl",
  slot5: "text-2xl font-black text-accent-200",
  slot6: "text-light-400",
  slot7:
    "p-6 border border-dashed border-primary-500/50 bg-dark-800/90 text-light-300 shadow-inner",
  slot8: "flex items-center gap-3",
  slot9: "text-2xl",
  slot10: "text-base font-medium",
  slot11: "flex flex-col gap-6",
  slot12: "space-y-4",
  slot13:
    "border border-primary-500/50 bg-dark-800/90 shadow-lg focus-within:border-accent-400 transition-all",
  slot14: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
  slot15: "flex-1 min-w-0",
  slot16: "flex flex-wrap items-center gap-3",
  slot17:
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-light-100 bg-primary-500/25 border border-primary-500/50",
  slot19: "mt-3 text-lg font-semibold text-light-100",
  slot20: "mt-3 flex flex-wrap items-center gap-3 text-sm text-light-300",
  slot21: "flex items-center gap-2 font-mono text-accent-200",
  slot22: "sr-only",
  slot23: "flex items-center gap-2",
});

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

  if (liveSessions.length === 0) {
    return (
      <Card {...styles.slot1}>
        <div {...styles.slot2}>
          <header {...styles.slot3}>
            <span aria-hidden="true" {...styles.slot4}>
              🕹️
            </span>
            <div>
              <h3 {...styles.slot5}>{t("admin.liveSessionsTitle")}</h3>
              <p {...styles.slot6}>{t("admin.liveSessionsSubtitle")}</p>
            </div>
          </header>
          <Card {...styles.slot7}>
            <div {...styles.slot8}>
              <span aria-hidden="true" {...styles.slot9}>
                🛰️
              </span>
              <p {...styles.slot10}>{t("admin.noLiveSessions")}</p>
            </div>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <Card {...styles.slot1}>
      <div {...styles.slot11}>
        <header {...styles.slot8}>
          <span aria-hidden="true" {...styles.slot4}>
            🕹️
          </span>
          <div>
            <h3 {...styles.slot5}>{t("admin.liveSessionsTitle")}</h3>
            <p {...styles.slot6}>{t("admin.liveSessionsSubtitle")}</p>
          </div>
        </header>
        <div {...styles.slot12}>
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
              <Card key={sessionKey} {...styles.slot13}>
                <div {...styles.slot14}>
                  <div {...styles.slot15}>
                    <div {...styles.slot16}>
                      <span {...styles.slot17}>
                        {t("admin.liveSessionBadge")}
                      </span>
                      <ArcadeBadge tone={tone} indicator pulse>
                        {t(`admin.sessionStatus.${session.status}`, {
                          defaultValue: session.status,
                        })}
                      </ArcadeBadge>
                    </div>
                    <h4 {...styles.slot19}>
                      {relatedQuiz?.title ?? t("admin.unknownQuiz")}
                    </h4>
                    <div {...styles.slot20}>
                      <span {...styles.slot21}>
                        <span {...styles.slot22}>
                          {t("admin.sessionPinLabel", { pin: session.pin })}
                        </span>
                        <span aria-hidden="true">PIN</span>
                        <span aria-hidden="true">{session.pin}</span>
                      </span>
                      <span>
                        {t("admin.sessionStartedLabel", {
                          date: formatSessionDate(createdAt),
                        })}
                      </span>
                    </div>
                  </div>
                  <div {...styles.slot23}>
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
  );
}
