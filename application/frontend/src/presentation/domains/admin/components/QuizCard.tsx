import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  Card,
  PrimaryButton,
  SecondaryButton,
} from "../../../../presentation/shared/ui/components";
import type { GameSession } from "../../../../domains/game/types";
import type { Quiz } from "../../../../domains/quiz/types";

const CARD_CONTAINER_CLASSES = "animate-scale-in";
const CARD_HEADER_WRAPPER_CLASSES = "mb-4";
const CARD_TITLE_ROW_CLASSES = "mb-2 flex items-start justify-between";
const CARD_TITLE_CLASSES =
  "flex-1 pr-2 text-base font-medium text-dark-900 dark:text-lg dark:font-semibold dark:text-light-100";
const LIVE_BADGE_CLASSES =
  "inline-flex items-center gap-1 rounded-lg border border-primary-500/40 bg-primary-200/60 px-2 py-1 text-xs font-bold text-accent-900 dark:bg-primary-500/20 dark:text-accent-200";
const LIVE_BADGE_INDICATOR_CLASSES =
  "h-2 w-2 rounded-full bg-accent-400 animate-pulse";
const DESCRIPTION_CLASSES =
  "mb-3 text-sm text-dark-500 dark:text-light-700 line-clamp-2";
const META_ROW_CLASSES =
  "flex items-center gap-3 text-xs text-dark-400 dark:text-light-600";
const META_ITEM_CLASSES = "flex items-center gap-1";
const ICON_CLASSES = "h-4 w-4";
const ACTIONS_ROW_CLASSES = "flex items-center gap-2";
const PRIMARY_ACTION_CONTAINER_CLASSES = "flex-1";
const SR_ONLY_CLASSES = "sr-only";

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  onManage: (quiz: Quiz) => void;
  onDelete?: (quizId: number) => void | Promise<void>;
  onLaunch: (quizId: number) => Promise<void>;
  isLive?: boolean;
  liveSession?: GameSession | null;
  onJoinSession?: (session: GameSession) => Promise<void> | void;
  isLaunchBlocked?: boolean;
}

export function QuizCard({
  quiz,
  index,
  onManage,
  onLaunch,
  onDelete,
  isLive,
  liveSession,
  onJoinSession,
  isLaunchBlocked = false,
}: QuizCardProps) {
  const { t } = useTranslation();
  const [isJoining, setIsJoining] = useState(false);
  const activeSession = useMemo(() => liveSession ?? null, [liveSession]);
  const isSessionLive = isLive ?? Boolean(activeSession ?? quiz.is_active);
  const shouldShowJoin = Boolean(activeSession);
  const launchTooltip =
    isSessionLive || isLaunchBlocked
      ? t("admin.liveSessionLaunchBlocked")
      : undefined;

  const handleJoin = useCallback(async () => {
    if (!activeSession || !onJoinSession || isJoining) {
      return;
    }

    setIsJoining(true);
    try {
      await Promise.resolve(onJoinSession(activeSession));
    } finally {
      setIsJoining(false);
    }
  }, [activeSession, isJoining, onJoinSession]);

  return (
    <div
      key={quiz.id}
      className={CARD_CONTAINER_CLASSES}
      style={{ animationDelay: `${index * 0.1}s` }}
      data-quiz-card="true"
    >
      <Card padding="md" elevation="glow" surface="panel" motion="none">
        <div className={CARD_HEADER_WRAPPER_CLASSES}>
          <div className={CARD_TITLE_ROW_CLASSES}>
            <h3 className={CARD_TITLE_CLASSES}>{quiz.title}</h3>
            {isSessionLive ? (
              <span className={LIVE_BADGE_CLASSES}>
                <span className={LIVE_BADGE_INDICATOR_CLASSES} />
                {t("admin.liveSessionBadge")}
              </span>
            ) : null}
          </div>
          <p className={DESCRIPTION_CLASSES}>
            {quiz.description || t("admin.noDescription")}
          </p>
          <div className={META_ROW_CLASSES}>
            <span className={META_ITEM_CLASSES}>
              <svg
                className={ICON_CLASSES}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {quiz.question_count || 0}{" "}
              {quiz.question_count === 1
                ? t("quiz.question")
                : t("quiz.questionsPlural")}
            </span>
          </div>
        </div>

        <div className={ACTIONS_ROW_CLASSES}>
          {shouldShowJoin ? (
            <div className={PRIMARY_ACTION_CONTAINER_CLASSES}>
              <Button
                size="sm"
                fullWidth
                variant="accent"
                onClick={handleJoin}
                disabled={isJoining}
                aria-label={t("admin.joinSessionButtonAria", {
                  pin: activeSession?.pin,
                })}
                icon={
                  <svg
                    className={ICON_CLASSES}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 7v6l5-3-5-3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12A9 9 0 113 12a9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                {isJoining ? t("common.loading") : t("admin.joinSessionButton")}
              </Button>
            </div>
          ) : (
            <div className={PRIMARY_ACTION_CONTAINER_CLASSES}>
              <PrimaryButton
                size="sm"
                fullWidth
                onClick={() => onLaunch(quiz.id)}
                aria-label={t("admin.launch")}
                disabled={isSessionLive || isLaunchBlocked}
                tooltip={launchTooltip}
                icon={
                  <svg
                    className={ICON_CLASSES}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                {t("admin.launch")}
              </PrimaryButton>
            </div>
          )}
          <SecondaryButton
            size="sm"
            onClick={() => onManage(quiz)}
            aria-label={t("admin.manage")}
            tooltip={t("admin.manage")}
            icon={
              <svg
                className={ICON_CLASSES}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            <span className={SR_ONLY_CLASSES}>{t("admin.manage")}</span>
          </SecondaryButton>
          {onDelete ? (
            <SecondaryButton
              size="sm"
              onClick={() => onDelete(quiz.id)}
              aria-label={t("admin.delete")}
              tooltip={t("admin.delete")}
              icon={
                <svg
                  className={ICON_CLASSES}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
            >
              <span className={SR_ONLY_CLASSES}>{t("admin.delete")}</span>
            </SecondaryButton>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
