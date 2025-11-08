import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
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

interface ManageQuizSessionsPageProps {
  quiz: Quiz;
  sessions: GameSession[];
  onRefreshSessions: () => Promise<void>;
  onRejoinSession: (session: GameSession) => Promise<void> | void;
}

const SESSION_PAGE_SIZE = 10;
const DEFAULT_STATUS_TONE =
  "bg-primary-500/20 text-accent-200 border border-primary-500/30";

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
    <div className="min-h-screen bg-game-gradient p-4 sm:p-8">
      <Container size="lg">
        <Card className="p-6 sm:p-8 mb-6 animate-slide-down">
          <div className="mb-4">
            <BackToButton
              label={t("admin.viewQuestions")}
              onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
              variant="ghost"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl">🕹️</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
                  {t("admin.sessionListTitle")}
                </h2>
              </div>
              <p className="text-light-700 mb-4">
                {t("admin.sessionListSubtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-light-400">
                <span className="glass-effect px-3 py-1 rounded-lg text-dark-700 font-semibold">
                  {quiz.title}
                </span>
                {quiz.description ? (
                  <span className="rounded-lg bg-dark-500/60 px-3 py-1">
                    {quiz.description}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <SecondaryButton
                size="lg"
                onClick={handleRefresh}
                disabled={isRefreshing}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v6h6M20 20v-6h-6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.64 17.36A9 9 0 1118.36 4.64"
                    />
                  </svg>
                }
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
          <Card className="p-10 text-center border-dashed border-primary-500/40 bg-dark-500/40 animate-fade-in">
            <div className="text-5xl mb-3">🛰️</div>
            <h3 className="text-2xl font-bold text-light-200 mb-2">
              {t("admin.sessionEmpty")}
            </h3>
            <p className="text-light-500 max-w-xl mx-auto">
              {t("admin.sessionEmptyDescription")}
            </p>
          </Card>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-light-500">
                {t("admin.sessionPaginationSummary", {
                  start: (page - 1) * SESSION_PAGE_SIZE + 1,
                  end: Math.min(
                    page * SESSION_PAGE_SIZE,
                    sortedSessions.length
                  ),
                  total: sortedSessions.length,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  aria-label={t("admin.sessionPaginationPrevious")}
                >
                  {t("admin.sessionPaginationPrevious")}
                </Button>
                <span className="text-sm font-semibold text-light-400">
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
              const tone = getSessionStatusTone(
                session.status,
                DEFAULT_STATUS_TONE
              );

              return (
                <Card
                  key={sessionKey}
                  className={
                    isLive
                      ? "border-primary-500/40 bg-dark-500/60"
                      : "border-dark-500/40 bg-dark-600/40"
                  }
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-light-400">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${tone}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        {resolveSessionStatusLabel(session.status)}
                      </span>
                      <span className="font-mono text-sm text-accent-200">
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
                    <div className="flex flex-col items-start gap-2 text-xs text-light-500 sm:items-end">
                      {sessionQuestions
                        ? t("admin.sessionCurrentQuestion", {
                            index: sessionQuestions,
                          })
                        : null}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-light-300">
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
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-primary-500/30 bg-dark-600/50 p-6 shadow-inner">
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-light-500">
                    {t("admin.sessionDetailsFields.status")}
                  </dt>
                  <dd className="mt-2 text-sm text-light-100">
                    {resolveSessionStatusLabel(detailSession.status)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-light-500">
                    {t("admin.sessionDetailsFields.startedAt")}
                  </dt>
                  <dd className="mt-2 text-sm text-light-100">
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
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-light-500">
                      {t("admin.sessionDetailsFields.sessionId")}
                    </dt>
                    <dd className="mt-2 text-sm text-light-100">
                      #{detailSessionId}
                    </dd>
                  </div>
                ) : null}
                {detailQuestionIndex ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-light-500">
                      {t("admin.sessionDetailsFields.questionIndex")}
                    </dt>
                    <dd className="mt-2 text-sm text-light-100">
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
