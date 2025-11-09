import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card } from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import {
  formatSessionDate,
  getSessionStatusTone,
} from "../shared/sessionUtils";

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
      <Card className="p-6 sm:p-8 mb-6 animate-fade-in bg-dark-700/80 border border-primary-500/30 shadow-xl">
        <div className="flex flex-col gap-4">
          <header className="flex items-center gap-3 mb-2">
            <span aria-hidden="true" className="text-5xl">
              🕹️
            </span>
            <div>
              <h3 className="text-2xl font-black text-accent-200">
                {t("admin.liveSessionsTitle")}
              </h3>
              <p className="text-light-400">
                {t("admin.liveSessionsSubtitle")}
              </p>
            </div>
          </header>
          <Card className="p-6 border border-dashed border-primary-500/50 bg-dark-800/90 text-light-300 shadow-inner">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-2xl">
                🛰️
              </span>
              <p className="text-base font-medium">
                {t("admin.noLiveSessions")}
              </p>
            </div>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 mb-6 animate-fade-in bg-dark-700/80 border border-primary-500/30 shadow-xl">
      <div className="flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <span aria-hidden="true" className="text-5xl">
            🕹️
          </span>
          <div>
            <h3 className="text-2xl font-black text-accent-200">
              {t("admin.liveSessionsTitle")}
            </h3>
            <p className="text-light-400">{t("admin.liveSessionsSubtitle")}</p>
          </div>
        </header>
        <div className="space-y-4">
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
                className="border border-primary-500/50 bg-dark-800/90 shadow-lg focus-within:border-accent-400 transition-all"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-light-100 bg-primary-500/25 border border-primary-500/50">
                        {t("admin.liveSessionBadge")}
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        {t(`admin.sessionStatus.${session.status}`, {
                          defaultValue: session.status,
                        })}
                      </span>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold text-light-100">
                      {relatedQuiz?.title ?? t("admin.unknownQuiz")}
                    </h4>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-light-300">
                      <span className="flex items-center gap-2 font-mono text-accent-200">
                        <span className="sr-only">
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
                  <div className="flex items-center gap-2">
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
