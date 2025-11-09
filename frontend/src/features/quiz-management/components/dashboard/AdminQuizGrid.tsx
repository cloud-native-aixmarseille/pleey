import { useTranslation } from "react-i18next";
import { Card, PrimaryButton } from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import { QuizCard } from "./QuizCard.tsx";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("AdminQuizGrid", {
  slot1: "p-12 text-center animate-scale-in",
  slot2: "text-6xl mb-4",
  slot3: "text-2xl font-bold text-dark-800 mb-2",
  slot4: "text-light-700 mb-6",
  slot5: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
});


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
      <Card {...styles.slot1}>
        <div {...styles.slot2}>🎮</div>
        <h3 {...styles.slot3}>
          {t("admin.noQuizzesTitle")}
        </h3>
        <p {...styles.slot4}>{t("admin.noQuizzesDescription")}</p>
        <PrimaryButton size="lg" onClick={onCreateQuizRequest}>
          {t("admin.createFirstQuiz")}
        </PrimaryButton>
      </Card>
    );
  }

  return (
    <div {...styles.slot5}>
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
