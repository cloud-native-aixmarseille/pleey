import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, SecondaryButton } from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import {
  formatSessionDate,
  getSessionStatusTone,
} from "../shared/sessionUtils";

interface AdminLiveSessionsSectionProps {
  sessions: GameSession[];
  quizLookup: Map<number, Quiz>;
  onManageQuiz: (quiz: Quiz) => void;
}

export function AdminLiveSessionsSection({
  sessions,
  quizLookup,
  onManageQuiz,
}: AdminLiveSessionsSectionProps) {
  const { t } = useTranslation();

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

  if (sortedSessions.length === 0) {
    return (
      <Card className="p-6 sm:p-8 mb-6 animate-fade-in">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🕹️</span>
            <div>
              <h3 className="text-2xl font-black text-gradient-neon">
                {t("admin.liveSessionsTitle")}
              </h3>
              <p className="text-light-700">
                {t("admin.liveSessionsSubtitle")}
              </p>
            </div>
          </div>
          <Card className="p-6 border-dashed border-primary-500/40 bg-dark-500/40">
            <div className="flex items-center gap-3 text-light-500">
              <span className="text-2xl">🛰️</span>
              <p>{t("admin.noLiveSessions")}</p>
            </div>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 mb-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">🕹️</span>
          <div>
            <h3 className="text-2xl font-black text-gradient-neon">
              {t("admin.liveSessionsTitle")}
            </h3>
            <p className="text-light-700">{t("admin.liveSessionsSubtitle")}</p>
          </div>
        </div>
        <div className="space-y-4">
          {sortedSessions.map((session) => {
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

            return (
              <Card
                key={sessionKey}
                className="border-primary-500/30 bg-dark-500/60 shadow-inner"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-light-200 bg-primary-500/20 border border-primary-500/40">
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
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-light-400">
                      <span className="font-mono text-accent-200">
                        {t("admin.sessionPinLabel", { pin: session.pin })}
                      </span>
                      <span>
                        {t("admin.sessionStartedLabel", {
                          date: formatSessionDate(createdAt),
                        })}
                      </span>
                    </div>
                  </div>
                  {relatedQuiz ? (
                    <div className="flex items-center gap-2">
                      <SecondaryButton
                        size="sm"
                        onClick={() => onManageQuiz(relatedQuiz)}
                      >
                        {t("admin.liveSessionView")}
                      </SecondaryButton>
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
