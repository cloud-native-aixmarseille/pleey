import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArcadeBadge,
  ArcadePage,
  BackToButton,
  Card,
  Modal,
  PrimaryButton,
  SecondaryButton,
} from "../../../../presentation/shared/ui/components";
import type { GameSession } from "../../../../domains/game/types";
import type { Quiz } from "../../../../domains/quiz/types";
import {
  formatSessionDate,
  getSessionStatusTone,
} from "../../admin/shared/sessionUtils";
const BACK_BUTTON_WRAPPER_CLASSES = "mb-4";
const HEADER_LAYOUT_CLASSES =
  "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between";
const HEADER_INFO_CLASSES = "flex-1";
const HEADER_TITLE_ROW_CLASSES = "flex items-center gap-2";
const HEADER_ICON_CLASSES = "text-4xl";
const HEADER_TITLE_CLASSES =
  "text-3xl font-black text-gradient-neon sm:text-4xl";
const HEADER_SUBTITLE_CLASSES = "mb-4 text-light-700";
const HEADER_META_CLASSES =
  "flex flex-wrap items-center gap-3 text-sm text-light-400";
const QUIZ_TITLE_BADGE_CLASSES =
  "glass-effect rounded-lg px-3 py-1 font-semibold text-light-100 drop-shadow-[0_0_12px_rgba(120,210,255,0.35)]";
const QUIZ_DESCRIPTION_BADGE_CLASSES = "rounded-lg bg-dark-500/60 px-3 py-1";
const HEADER_ACTIONS_CLASSES = "flex flex-col gap-3 sm:flex-row";

const EMPTY_STATE_CONTENT_CLASSES = "flex flex-col items-center text-center";
const EMPTY_STATE_PANEL_CLASSES =
  "w-full animate-fade-in rounded-[var(--arcade-radius-lg)] border border-dashed border-primary-500/40 bg-dark-500/40 p-10";
const EMPTY_ICON_CLASSES = "mb-3 text-5xl";
const EMPTY_TITLE_CLASSES = "mb-2 text-2xl font-bold text-light-200";
const EMPTY_DESCRIPTION_CLASSES = "mx-auto max-w-xl text-light-500";

const SESSION_LIST_WRAPPER_CLASSES = "space-y-4 animate-slide-up";
const PAGINATION_BAR_CLASSES =
  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";
const PAGINATION_SUMMARY_CLASSES = "text-sm text-light-500";
const PAGINATION_CONTROLS_CLASSES = "flex items-center gap-2";
const PAGINATION_PAGE_LABEL_CLASSES = "text-sm font-semibold text-light-400";

const SESSION_CARD_WRAPPER_BASE_CLASSES =
  "rounded-[var(--arcade-radius-xl)] border bg-dark-600/40 shadow-lg transition-all";
const SESSION_CARD_LIVE_CLASSES = "border-primary-500/40 bg-dark-500/60";
const SESSION_CARD_DEFAULT_CLASSES = "border-dark-500/40 bg-dark-600/40";
const SESSION_CARD_CONTENT_CLASSES =
  "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between";
const SESSION_META_ROW_CLASSES =
  "flex flex-wrap items-center gap-3 text-xs text-light-400";
const SESSION_PIN_CLASSES = "font-mono text-sm text-accent-200";
const SESSION_ACTIONS_COLUMN_CLASSES =
  "flex flex-col items-start gap-2 text-xs text-light-500 sm:items-end";
const SESSION_ACTIONS_ROW_CLASSES =
  "flex flex-wrap items-center gap-2 text-xs text-light-300";

const DETAIL_MODAL_CONTENT_CLASSES = "space-y-5";
const DETAIL_CARD_WRAPPER_CLASSES =
  "rounded-[2rem] border border-primary-500/30 bg-dark-600/50 p-6 shadow-inner";
const DETAIL_GRID_CLASSES = "grid gap-6 sm:grid-cols-2";
const DETAIL_TERM_CLASSES =
  "text-xs font-semibold uppercase tracking-[0.25em] text-light-500";
const DETAIL_VALUE_CLASSES = "mt-2 text-sm text-light-100";

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
      const leftDate = new Date(left.createdAt ?? 0).getTime();
      const rightDate = new Date(right.createdAt ?? 0).getTime();
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
    ? detailSession.sessionId ?? null
    : null;

  const detailQuestionIndex = detailSession
    ? detailSession.currentQuestion ?? null
    : null;

  return (
    <>
      <ArcadePage variant="gradient" padding="lg" contentWidth="xl" gap="lg">
        <Card padding="lg" surface="panel" border="none" motion="slide-down">
          <div className={BACK_BUTTON_WRAPPER_CLASSES}>
            <BackToButton
              label={t("admin.viewQuestions")}
              onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
            />
          </div>

          <div className={HEADER_LAYOUT_CLASSES}>
            <div className={HEADER_INFO_CLASSES}>
              <div className={HEADER_TITLE_ROW_CLASSES}>
                <span aria-hidden className={HEADER_ICON_CLASSES}>
                  🕹️
                </span>
                <h2 className={HEADER_TITLE_CLASSES}>
                  {t("admin.sessionListTitle")}
                </h2>
              </div>
              <p className={HEADER_SUBTITLE_CLASSES}>
                {t("admin.sessionListSubtitle")}
              </p>
              <div className={HEADER_META_CLASSES}>
                <span className={QUIZ_TITLE_BADGE_CLASSES}>{quiz.title}</span>
                {quiz.description ? (
                  <span className={QUIZ_DESCRIPTION_BADGE_CLASSES}>
                    {quiz.description}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={HEADER_ACTIONS_CLASSES}>
              <SecondaryButton
                size="lg"
                onClick={handleRefresh}
                disabled={isRefreshing}
                icon={{ name: "RefreshCw" }}
              >
                {isRefreshing ? t("common.loading") : t("admin.sessionRefresh")}
              </SecondaryButton>
            </div>
          </div>
        </Card>

        {sortedSessions.length === 0 ? (
          <Card
            padding="lg"
            surface="panel"
            border="none"
            motion="fade"
            alignment="center"
          >
            <div
              className={`${EMPTY_STATE_PANEL_CLASSES} ${EMPTY_STATE_CONTENT_CLASSES}`}
            >
              <span aria-hidden className={EMPTY_ICON_CLASSES}>
                🛰️
              </span>
              <h3 className={EMPTY_TITLE_CLASSES}>{t("admin.sessionEmpty")}</h3>
              <p className={EMPTY_DESCRIPTION_CLASSES}>
                {t("admin.sessionEmptyDescription")}
              </p>
            </div>
          </Card>
        ) : (
          <Card padding="lg" surface="panel" border="none" motion="none">
            <div className={SESSION_LIST_WRAPPER_CLASSES}>
              <div className={PAGINATION_BAR_CLASSES}>
                <p className={PAGINATION_SUMMARY_CLASSES}>
                  {t("admin.sessionPaginationSummary", {
                    start: (page - 1) * SESSION_PAGE_SIZE + 1,
                    end: Math.min(
                      page * SESSION_PAGE_SIZE,
                      sortedSessions.length
                    ),
                    total: sortedSessions.length,
                  })}
                </p>
                <div className={PAGINATION_CONTROLS_CLASSES}>
                  <SecondaryButton
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    aria-label={t("admin.sessionPaginationPrevious")}
                    effect="flat"
                  >
                    {t("admin.sessionPaginationPrevious")}
                  </SecondaryButton>
                  <span className={PAGINATION_PAGE_LABEL_CLASSES}>
                    {t("admin.sessionPaginationPage", { page, totalPages })}
                  </span>
                  <SecondaryButton
                    size="sm"
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={page === totalPages}
                    aria-label={t("admin.sessionPaginationNext")}
                    effect="flat"
                  >
                    {t("admin.sessionPaginationNext")}
                  </SecondaryButton>
                </div>
              </div>

              {paginatedSessions.map((session) => {
                const isLive = ["waiting", "active", "paused"].includes(
                  session.status
                );
                const createdAt = session.createdAt ?? null;
                const sessionKey = `${
                  session.sessionId ?? session.pin ?? "session"
                }-${session.status}-${createdAt ?? 0}`;
                const sessionQuestions = session.currentQuestion ?? null;
                const tone = getSessionStatusTone(session.status);
                const sessionWrapperClasses = `${SESSION_CARD_WRAPPER_BASE_CLASSES} ${
                  isLive
                    ? SESSION_CARD_LIVE_CLASSES
                    : SESSION_CARD_DEFAULT_CLASSES
                }`;

                return (
                  <div key={sessionKey} className={sessionWrapperClasses}>
                    <Card
                      padding="md"
                      surface="panel"
                      border="none"
                      motion="none"
                    >
                      <div className={SESSION_CARD_CONTENT_CLASSES}>
                        <div className={SESSION_META_ROW_CLASSES}>
                          <ArcadeBadge variant={tone} indicator pulse>
                            {resolveSessionStatusLabel(session.status)}
                          </ArcadeBadge>
                          <span className={SESSION_PIN_CLASSES}>
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

                        <div className={SESSION_ACTIONS_COLUMN_CLASSES}>
                          {sessionQuestions
                            ? t("admin.sessionCurrentQuestion", {
                                index: sessionQuestions,
                              })
                            : null}
                          <div className={SESSION_ACTIONS_ROW_CLASSES}>
                            {isLive ? (
                              <PrimaryButton
                                size="sm"
                                onClick={() =>
                                  handleRejoin(session, sessionKey)
                                }
                                disabled={rejoiningKey === sessionKey}
                              >
                                {rejoiningKey === sessionKey
                                  ? t("common.loading")
                                  : t("admin.sessionRejoin")}
                              </PrimaryButton>
                            ) : (
                              <SecondaryButton
                                size="sm"
                                onClick={() => handleOpenDetails(session)}
                                effect="flat"
                              >
                                {t("admin.sessionViewDetails")}
                              </SecondaryButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </ArcadePage>

      <Modal
        isOpen={detailSession !== null}
        onClose={handleCloseDetails}
        title={detailTitle}
        description={detailDescription}
        footer={
          <PrimaryButton size="sm" onClick={handleCloseDetails}>
            {t("common.close")}
          </PrimaryButton>
        }
      >
        {detailSession ? (
          <div className={DETAIL_MODAL_CONTENT_CLASSES}>
            <div className={DETAIL_CARD_WRAPPER_CLASSES}>
              <dl className={DETAIL_GRID_CLASSES}>
                <div>
                  <dt className={DETAIL_TERM_CLASSES}>
                    {t("admin.sessionDetailsFields.status")}
                  </dt>
                  <dd className={DETAIL_VALUE_CLASSES}>
                    {resolveSessionStatusLabel(detailSession.status)}
                  </dd>
                </div>
                <div>
                  <dt className={DETAIL_TERM_CLASSES}>
                    {t("admin.sessionDetailsFields.startedAt")}
                  </dt>
                  <dd className={DETAIL_VALUE_CLASSES}>
                    {formatSessionDate(detailSession.createdAt ?? null, {
                      fallback: t("admin.sessionUnknownDate"),
                    })}
                  </dd>
                </div>
                {detailSessionId ? (
                  <div>
                    <dt className={DETAIL_TERM_CLASSES}>
                      {t("admin.sessionDetailsFields.sessionId")}
                    </dt>
                    <dd className={DETAIL_VALUE_CLASSES}>#{detailSessionId}</dd>
                  </div>
                ) : null}
                {detailQuestionIndex ? (
                  <div>
                    <dt className={DETAIL_TERM_CLASSES}>
                      {t("admin.sessionDetailsFields.questionIndex")}
                    </dt>
                    <dd className={DETAIL_VALUE_CLASSES}>
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
    </>
  );
}
