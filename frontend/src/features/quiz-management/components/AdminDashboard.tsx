import { Quiz } from "../../../shared/types";
import { Button, Card, Container } from "../../../shared/components";
import { OrganizationSelector } from "../../../shared/components/organization/OrganizationSelector";
import { StatsCard } from "../../../shared/components/stats/StatsCard";
import { QuizCard } from "./QuizCard";
import { useOrganization } from "../../../shared/context/OrganizationContext";
import { useTranslation } from "react-i18next";

interface AdminDashboardProps {
  quizzes: Quiz[];
  onCreateQuiz: (
    title: string,
    description: string,
    organizationId: number
  ) => Promise<void>;
  onManageQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: number) => Promise<void> | void;
  onLaunchQuiz: (quizId: number) => Promise<void>;
}

export default function AdminDashboard({
  quizzes,
  onCreateQuiz,
  onManageQuiz,
  onDeleteQuiz,
  onLaunchQuiz,
}: AdminDashboardProps) {
  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (!onDeleteQuiz) {
      return;
    }

    const confirmed = confirm(
      t("admin.confirmDeleteQuiz", { title: quiz.title })
    );

    if (!confirmed) {
      return;
    }

    await onDeleteQuiz(quiz.id);
  };
  const { t } = useTranslation();
  const { currentOrganization } = useOrganization();

  const handleCreateQuiz = () => {
    if (!currentOrganization) {
      alert(t("admin.selectOrganizationFirst"));
      return;
    }

    const title = prompt(t("admin.promptQuizTitle"));
    const description = prompt(t("admin.promptQuizDescription"));
    if (title) onCreateQuiz(title, description || "", currentOrganization.id);
  };

  const activeQuizzes = quizzes.filter((q) => q.is_active);
  const totalQuestions = quizzes.reduce(
    (sum, quiz) => sum + (quiz.question_count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8">
      <Container size="xl">
        {/* Header Section */}
        <Card className="p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl animate-bounce-slow">👑</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
                  {t("admin.dashboard")}
                </h2>
              </div>
              <p className="text-light-700">
                {t("admin.manageQuizzesSubtitle")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <OrganizationSelector />
              <Button
                variant="accent"
                size="lg"
                onClick={handleCreateQuiz}
                disabled={!currentOrganization}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                {t("admin.createQuiz")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <StatsCard
            label={t("admin.totalQuizzes")}
            value={quizzes.length}
            icon="📚"
            variant="primary"
          />
          <StatsCard
            label={t("admin.activeQuizzes")}
            value={activeQuizzes.length}
            icon="🎯"
            variant="secondary"
          />
          <StatsCard
            label={t("admin.questions")}
            value={totalQuestions}
            icon="❓"
            variant="accent"
          />
        </div>

        {/* Quiz Grid */}
        {quizzes.length === 0 ? (
          <Card className="p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-dark-800 mb-2">
              {t("admin.noQuizzesTitle")}
            </h3>
            <p className="text-light-700 mb-6">
              {t("admin.noQuizzesDescription")}
            </p>
            <Button variant="primary" size="lg" onClick={handleCreateQuiz}>
              {t("admin.createFirstQuiz")}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                index={index}
                onManage={onManageQuiz}
                onDelete={() => handleDeleteQuiz(quiz)}
                onLaunch={onLaunchQuiz}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
