import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArcadeBadge,
  BackToButton,
  Button,
  Card,
  Container,
  Modal,
  SecondaryButton,
} from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import {
  formatSessionDate,
  getSessionStatusTone,
} from "../shared/sessionUtils";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("ManageQuizSessionsPage", {
  slot1: "min-h-screen bg-game-gradient p-4 sm:p-8",
  slot2: "p-6 sm:p-8 mb-6 animate-slide-down",
  slot3: "mb-4",
  slot4:
    "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
  slot5: "flex-1",
  slot6: "flex items-center gap-2 mb-2",
  slot7: "text-4xl",
  slot8: "text-3xl sm:text-4xl font-black text-gradient-neon",
  slot9: "text-light-700 mb-4",
  slot10: "flex flex-wrap items-center gap-3 text-sm text-light-400",
  slot11: "glass-effect px-3 py-1 rounded-lg text-dark-700 font-semibold",
  slot12: "rounded-lg bg-dark-500/60 px-3 py-1",
  slot13: "flex flex-col sm:flex-row gap-3",
  slot15:
    "p-10 text-center border-dashed border-primary-500/40 bg-dark-500/40 animate-fade-in",
  slot16: "text-5xl mb-3",
  slot17: "text-2xl font-bold text-light-200 mb-2",
  slot18: "text-light-500 max-w-xl mx-auto",
  slot19: "space-y-4 animate-slide-up",
  slot20: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
  slot21: "text-sm text-light-500",
  slot22: "flex items-center gap-2",
  slot23: "text-sm font-semibold text-light-400",
  slot24: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
  slot25: "flex flex-wrap items-center gap-3 text-xs text-light-400",
  slot27: "font-mono text-sm text-accent-200",
  slot28: "flex flex-col items-start gap-2 text-xs text-light-500 sm:items-end",
  slot29: "flex flex-wrap items-center gap-2 text-xs text-light-300",
  slot30: "space-y-5",
  slot31:
    "rounded-[2rem] border border-primary-500/30 bg-dark-600/50 p-6 shadow-inner",
  slot32: "grid gap-6 sm:grid-cols-2",
  slot33: "text-xs font-semibold uppercase tracking-[0.25em] text-light-500",
  slot34: "mt-2 text-sm text-light-100",
  sessionCardLive: "border-primary-500/40 bg-dark-500/60",
  sessionCardDefault: "border-dark-500/40 bg-dark-600/40",
});

interface ManageQuizSessionsPageProps {
  quiz: Quiz;
  sessions: GameSession[];
  onRefreshSessions: () => Promise<void>;
  onRejoinSession: (session: GameSession) => Promise<void> | void;
}

const SESSION_PAGE_SIZE = 10;

export function ManageQuizSessionsPage({
  quiz,
  sessions,
  onRefreshSessions,
  onRejoinSession,
}: ManageQuizSessionsPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [rejoiningKey, setRejoiningKey] = useState<string | null>(null);
  const [detailSession, setDetailSession] = useState<GameSession | null>(null);

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

  useEffect(() => {
    setPage(1);
  }, [sessions]);

  const totalPages = useMemo(() => {
    if (sortedSessions.length === 0) {
      return 1;
    }
    return Math.ceil(sortedSessions.length / SESSION_PAGE_SIZE);
  }, [sortedSessions.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedSessions = useMemo(() => {
    const start = (page - 1) * SESSION_PAGE_SIZE;
    const end = page * SESSION_PAGE_SIZE;
    return sortedSessions.slice(start, end);
  }, [page, sortedSessions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshSessions();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRejoin = async (session: GameSession, sessionKey: string) => {
    if (rejoiningKey) {
      return;
    }

    setRejoiningKey(sessionKey);
    try {
      await Promise.resolve(onRejoinSession(session));
    } finally {
      setRejoiningKey(null);
    }
  };

  const handleOpenDetails = (session: GameSession) => {
    setDetailSession(session);
  };

  const handleCloseDetails = () => {
    setDetailSession(null);
  };

  const resolveSessionStatusLabel = (status: string) =>
    t(`admin.sessionStatus.${status}`, { defaultValue: status });

  const detailTitle = detailSession
    ? t("admin.sessionDetailsTitle", { pin: detailSession.pin })
    : "";

  const detailDescription = detailSession
    ? t("admin.sessionDetailsDescription", {
        status: resolveSessionStatusLabel(detailSession.status),
      })
    : undefined;

  const detailSessionId = detailSession
    ? detailSession.sessionId ?? detailSession.session_id ?? null
    : null;

  const detailQuestionIndex = detailSession
    ? detailSession.currentQuestion ?? detailSession.current_question ?? null
    : null;

  return (
    <div {...styles.slot1}>
      <Container size="lg">
        <Card {...styles.slot2}>
          <div {...styles.slot3}>
            <BackToButton
              label={t("admin.viewQuestions")}
              onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
              variant="ghost"
            />
          </div>

          <div {...styles.slot4}>
            <div {...styles.slot5}>
              <div {...styles.slot6}>
                <span {...styles.slot7}>🕹️</span>
                <h2 {...styles.slot8}>{t("admin.sessionListTitle")}</h2>
              </div>
              <p {...styles.slot9}>{t("admin.sessionListSubtitle")}</p>
              <div {...styles.slot10}>
                <span {...styles.slot11}>{quiz.title}</span>
                {quiz.description ? (
                  <span {...styles.slot12}>{quiz.description}</span>
                ) : null}
              </div>
            </div>
            <div {...styles.slot13}>
              <SecondaryButton
                size="lg"
                onClick={handleRefresh}
                disabled={isRefreshing}
                icon={{ name: "RefreshCw" }}
              >
                {isRefreshing ? t("common.loading") : t("admin.sessionRefresh")}
              </SecondaryButton>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
              >
                {t("admin.viewQuestions")}
              </Button>
            </div>
          </div>
        </Card>

        {sortedSessions.length === 0 ? (
          <Card {...styles.slot15}>
            <div {...styles.slot16}>🛰️</div>
            <h3 {...styles.slot17}>{t("admin.sessionEmpty")}</h3>
            <p {...styles.slot18}>{t("admin.sessionEmptyDescription")}</p>
          </Card>
        ) : (
          <div {...styles.slot19}>
            <div {...styles.slot20}>
              <p {...styles.slot21}>
                {t("admin.sessionPaginationSummary", {
                  start: (page - 1) * SESSION_PAGE_SIZE + 1,
                  end: Math.min(
                    page * SESSION_PAGE_SIZE,
                    sortedSessions.length
                  ),
                  total: sortedSessions.length,
                })}
              </p>
              <div {...styles.slot22}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  aria-label={t("admin.sessionPaginationPrevious")}
                >
                  {t("admin.sessionPaginationPrevious")}
                </Button>
                <span {...styles.slot23}>
                  {t("admin.sessionPaginationPage", { page, totalPages })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page === totalPages}
                  aria-label={t("admin.sessionPaginationNext")}
                >
                  {t("admin.sessionPaginationNext")}
                </Button>
              </div>
            </div>

            {paginatedSessions.map((session) => {
              const isLive = ["waiting", "active", "paused"].includes(
                session.status
              );
              const createdAt = session.createdAt ?? session.created_at ?? null;
              const sessionKey = `${
                session.sessionId ?? session.pin ?? "session"
              }-${session.status}-${createdAt ?? 0}`;
              const sessionQuestions =
                session.currentQuestion ?? session.current_question ?? null;
              const tone = getSessionStatusTone(session.status);
              const cardTone = isLive
                ? styles.sessionCardLive
                : styles.sessionCardDefault;

              return (
                <Card key={sessionKey} {...cardTone}>
                  <div {...styles.slot24}>
                    <div {...styles.slot25}>
                      <ArcadeBadge tone={tone} indicator pulse>
                        {resolveSessionStatusLabel(session.status)}
                      </ArcadeBadge>
                      <span {...styles.slot27}>
                        {t("admin.sessionPinLabel", { pin: session.pin })}
                      </span>
                      <span>
                        {t("admin.sessionStartedLabel", {
                          date: formatSessionDate(createdAt, {
                            fallback: t("admin.sessionUnknownDate"),
                          }),
                        })}
                      </span>
                    </div>
                    <div {...styles.slot28}>
                      {sessionQuestions
                        ? t("admin.sessionCurrentQuestion", {
                            index: sessionQuestions,
                          })
                        : null}
                      <div {...styles.slot29}>
                        {isLive ? (
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => handleRejoin(session, sessionKey)}
                            disabled={rejoiningKey === sessionKey}
                          >
                            {rejoiningKey === sessionKey
                              ? t("common.loading")
                              : t("admin.sessionRejoin")}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(session)}
                          >
                            {t("admin.sessionViewDetails")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
      <Modal
        isOpen={detailSession !== null}
        onClose={handleCloseDetails}
        title={detailTitle}
        description={detailDescription}
        footer={
          <Button variant="accent" size="sm" onClick={handleCloseDetails}>
            {t("common.close")}
          </Button>
        }
      >
        {detailSession ? (
          <div {...styles.slot30}>
            <div {...styles.slot31}>
              <dl {...styles.slot32}>
                <div>
                  <dt {...styles.slot33}>
                    {t("admin.sessionDetailsFields.status")}
                  </dt>
                  <dd {...styles.slot34}>
                    {resolveSessionStatusLabel(detailSession.status)}
                  </dd>
                </div>
                <div>
                  <dt {...styles.slot33}>
                    {t("admin.sessionDetailsFields.startedAt")}
                  </dt>
                  <dd {...styles.slot34}>
                    {formatSessionDate(
                      detailSession.createdAt ??
                        detailSession.created_at ??
                        null,
                      { fallback: t("admin.sessionUnknownDate") }
                    )}
                  </dd>
                </div>
                {detailSessionId ? (
                  <div>
                    <dt {...styles.slot33}>
                      {t("admin.sessionDetailsFields.sessionId")}
                    </dt>
                    <dd {...styles.slot34}>#{detailSessionId}</dd>
                  </div>
                ) : null}
                {detailQuestionIndex ? (
                  <div>
                    <dt {...styles.slot33}>
                      {t("admin.sessionDetailsFields.questionIndex")}
                    </dt>
                    <dd {...styles.slot34}>
                      {t("admin.sessionCurrentQuestion", {
                        index: detailQuestionIndex,
                      })}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
