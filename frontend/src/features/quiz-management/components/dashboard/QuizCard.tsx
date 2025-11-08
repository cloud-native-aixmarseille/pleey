import { useTranslation } from "react-i18next";
import {
  Card,
  PrimaryButton,
  SecondaryButton,
} from "../../../../shared/components";
import type { Quiz } from "../../../../shared/types";

interface QuizCardProps {
  quiz: Quiz;
  index: number;
  onManage: (quiz: Quiz) => void;
  onDelete?: (quizId: number) => void | Promise<void>;
  onLaunch: (quizId: number) => Promise<void>;
  isLive?: boolean;
}

export function QuizCard({
  quiz,
  index,
  onManage,
  onLaunch,
  onDelete,
  isLive,
}: QuizCardProps) {
  const { t } = useTranslation();
  const isSessionLive = isLive ?? Boolean(quiz.is_active);

  return (
    <Card
      key={quiz.id}
      hover
      className="p-6 animate-scale-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-dark-800 flex-1 pr-2">
            {quiz.title}
          </h3>
          {isSessionLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/20 text-accent-200 border border-primary-500/40 text-xs font-bold">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              {t("admin.liveSessionBadge")}
            </span>
          ) : null}
        </div>
        <p className="text-light-700 text-sm line-clamp-2 mb-3">
          {quiz.description || t("admin.noDescription")}
        </p>
        <div className="flex items-center gap-3 text-xs text-light-600">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
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

      <div className="flex items-center gap-2">
        <PrimaryButton
          size="sm"
          className="flex-1"
          onClick={() => onLaunch(quiz.id)}
          aria-label={t("admin.launch")}
          disabled={isSessionLive}
          tooltip={
            isSessionLive ? t("admin.liveSessionLaunchBlocked") : undefined
          }
          icon={
            <svg
              className="w-4 h-4"
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
        <SecondaryButton
          size="sm"
          onClick={() => onManage(quiz)}
          aria-label={t("admin.manage")}
          tooltip={t("admin.manage")}
          icon={
            <svg
              className="w-4 h-4"
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
          <span className="sr-only">{t("admin.manage")}</span>
        </SecondaryButton>
        {onDelete ? (
          <SecondaryButton
            size="sm"
            onClick={() => onDelete(quiz.id)}
            aria-label={t("admin.delete")}
            tooltip={t("admin.delete")}
            icon={
              <svg
                className="w-4 h-4"
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
            <span className="sr-only">{t("admin.delete")}</span>
          </SecondaryButton>
        ) : null}
      </div>
    </Card>
  );
}
