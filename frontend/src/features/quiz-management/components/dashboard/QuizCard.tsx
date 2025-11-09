import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  PrimaryButton,
  SecondaryButton,
} from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("QuizCard", {
  slot1: "p-6 animate-scale-in",
  slot2: "mb-4",
  slot3: "flex items-start justify-between mb-2",
  slot4: "text-xl font-bold text-dark-800 flex-1 pr-2",
  slot5: "inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/20 text-accent-200 border border-primary-500/40 text-xs font-bold",
  slot6: "w-2 h-2 bg-accent-400 rounded-full animate-pulse",
  slot7: "text-light-700 text-sm line-clamp-2 mb-3",
  slot8: "flex items-center gap-3 text-xs text-light-600",
  slot9: "flex items-center gap-1",
  slot10: "w-4 h-4",
  slot11: "flex items-center gap-2",
  slot12: "flex-1",
  slot13: "sr-only",
});


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
    <Card
      key={quiz.id}
      hover
      {...styles.slot1}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div {...styles.slot2}>
        <div {...styles.slot3}>
          <h3 {...styles.slot4}>
            {quiz.title}
          </h3>
          {isSessionLive ? (
            <span {...styles.slot5}>
              <span {...styles.slot6} />
              {t("admin.liveSessionBadge")}
            </span>
          ) : null}
        </div>
        <p {...styles.slot7}>
          {quiz.description || t("admin.noDescription")}
        </p>
        <div {...styles.slot8}>
          <span {...styles.slot9}>
            <svg
              {...styles.slot10}
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

      <div {...styles.slot11}>
        {shouldShowJoin ? (
          <div {...styles.slot12}>
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
                  {...styles.slot10}
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
          <div {...styles.slot12}>
            <PrimaryButton
              size="sm"
              fullWidth
              onClick={() => onLaunch(quiz.id)}
              aria-label={t("admin.launch")}
              disabled={isSessionLive || isLaunchBlocked}
              tooltip={launchTooltip}
              icon={
                <svg
                  {...styles.slot10}
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
              {...styles.slot10}
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
          <span {...styles.slot13}>{t("admin.manage")}</span>
        </SecondaryButton>
        {onDelete ? (
          <SecondaryButton
            size="sm"
            onClick={() => onDelete(quiz.id)}
            aria-label={t("admin.delete")}
            tooltip={t("admin.delete")}
            icon={
              <svg
                {...styles.slot10}
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
            <span {...styles.slot13}>{t("admin.delete")}</span>
          </SecondaryButton>
        ) : null}
      </div>
    </Card>
  );
}
