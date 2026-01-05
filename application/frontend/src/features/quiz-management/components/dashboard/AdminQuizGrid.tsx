import { useTranslation } from "react-i18next";
import { Card, PrimaryButton } from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import { QuizCard } from "./QuizCard.tsx";

const EMPTY_STATE_WRAPPER_CLASSES = "animate-scale-in text-center";
const EMPTY_STATE_CONTENT_CLASSES = "flex flex-col items-center gap-4 p-12";
const EMPTY_STATE_ICON_CLASSES = "text-6xl";
const EMPTY_STATE_TITLE_CLASSES =
  "text-xl font-semibold text-dark-900 dark:text-2xl dark:font-bold dark:text-light-100";
const EMPTY_STATE_DESCRIPTION_CLASSES = "text-dark-400 dark:text-light-700";
const QUIZ_GRID_CLASSES =
  "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";

interface AdminQuizGridProps {
  quizzes: Quiz[];
  liveQuizIds: Set<number>;
  onManageQuiz: (quiz: Quiz) => void;
  onDeleteQuizRequest: (quiz: Quiz) => void;
  onLaunchQuiz: (quizId: number) => Promise<void>;
  onCreateQuizRequest: () => void;
  onJoinSession: (session: GameSession) => Promise<void> | void;
  liveSessionsByQuiz: Map<number, GameSession>;
  isLaunchBlocked: boolean;
}

export function AdminQuizGrid({
  quizzes,
  liveQuizIds,
  onManageQuiz,
  onDeleteQuizRequest,
  onLaunchQuiz,
  onCreateQuizRequest,
  onJoinSession,
  liveSessionsByQuiz,
  isLaunchBlocked,
}: AdminQuizGridProps) {
  const { t } = useTranslation();

  if (quizzes.length === 0) {
    return (
      <div className={EMPTY_STATE_WRAPPER_CLASSES} data-admin-quiz-empty="true">
        <Card
          surface="glass"
          tone="neutral"
          padding="xl"
          elevation="glow"
          border="regular"
          alignment="center"
        >
          <div className={EMPTY_STATE_CONTENT_CLASSES}>
            <div className={EMPTY_STATE_ICON_CLASSES} aria-hidden="true">
              🎮
            </div>
            <h3 className={EMPTY_STATE_TITLE_CLASSES}>
              {t("admin.noQuizzesTitle")}
            </h3>
            <p className={EMPTY_STATE_DESCRIPTION_CLASSES}>
              {t("admin.noQuizzesDescription")}
            </p>
            <PrimaryButton size="lg" onClick={onCreateQuizRequest}>
              {t("admin.createFirstQuiz")}
            </PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={QUIZ_GRID_CLASSES} data-admin-quiz-grid="true">
      {quizzes.map((quiz, index) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          index={index}
          onManage={onManageQuiz}
          onDelete={() => onDeleteQuizRequest(quiz)}
          onLaunch={onLaunchQuiz}
          isLive={liveQuizIds.has(quiz.id)}
          liveSession={liveSessionsByQuiz.get(quiz.id)}
          onJoinSession={onJoinSession}
          isLaunchBlocked={isLaunchBlocked}
        />
      ))}
    </div>
  );
}
