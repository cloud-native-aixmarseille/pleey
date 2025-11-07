import { useState } from "react";
import { Quiz } from "../../../shared/types";
import {
  Button,
  Card,
  Container,
  Input,
  Modal,
} from "../../../shared/components";
import { OrganizationSelector } from "../../../shared/components/organization/OrganizationSelector";
import { StatsCard } from "../../../shared/components/stats/StatsCard";
import { QuizCard } from "./QuizCard";
import { useOrganization } from "../../../shared/context/OrganizationContext";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

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
  const { t } = useTranslation();
  const { currentOrganization } = useOrganization();
  const { notify, notifyFromError } = useNotifications();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [quizPendingDeletion, setQuizPendingDeletion] = useState<Quiz | null>(
    null
  );

  const openCreateModal = () => {
    if (!currentOrganization) {
      notify("admin.selectOrganizationFirst", "error");
      return;
    }

    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateTitle("");
    setCreateDescription("");
    setIsProcessing(false);
  };

  const submitCreateQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganization || !createTitle.trim()) {
      return;
    }

    try {
      setIsProcessing(true);
      await onCreateQuiz(
        createTitle.trim(),
        createDescription.trim(),
        currentOrganization.id
      );
      notify("admin.createQuizSuccess", "success");
      closeCreateModal();
    } catch (error) {
      setIsProcessing(false);
      notifyFromError(error, "errors.createQuizFailed");
    }
  };

  const requestDeleteQuiz = (quiz: Quiz) => {
    setQuizPendingDeletion(quiz);
  };

  const cancelDeleteQuiz = () => {
    setQuizPendingDeletion(null);
    setIsProcessing(false);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizPendingDeletion || !onDeleteQuiz) {
      return;
    }

    try {
      setIsProcessing(true);
      await onDeleteQuiz(quizPendingDeletion.id);
      notify("admin.deleteQuizSuccess", "success");
      cancelDeleteQuiz();
    } catch (error) {
      setIsProcessing(false);
      notifyFromError(error, "errors.deleteQuizFailed");
    }
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
                onClick={openCreateModal}
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
            <Button variant="primary" size="lg" onClick={openCreateModal}>
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
                onDelete={() => requestDeleteQuiz(quiz)}
                onLaunch={onLaunchQuiz}
              />
            ))}
          </div>
        )}
      </Container>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={t("admin.createQuizModalTitle")}
        description={t("admin.createQuizModalDescription")}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreateModal}
              disabled={isProcessing}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="create-quiz-form"
              variant="accent"
              disabled={isProcessing || !createTitle.trim()}
            >
              {isProcessing ? t("common.loading") : t("admin.createQuiz")}
            </Button>
          </>
        }
      >
        <form id="create-quiz-form" onSubmit={submitCreateQuiz}>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-500">
                {t("admin.quizTitle")}
              </label>
              <Input
                type="text"
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
                placeholder={t("admin.quizTitle")}
                required
                className="mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-500">
                {t("admin.description")}
              </label>
              <textarea
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-primary-500/30 bg-dark-500/60 p-4 text-sm text-light-100 shadow-inner focus:border-primary-400 focus:outline-none"
                placeholder={t("admin.promptQuizDescription")}
              />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={quizPendingDeletion !== null}
        onClose={cancelDeleteQuiz}
        title={t("admin.deleteQuizModalTitle")}
        description={t("admin.deleteQuizModalDescription", {
          title: quizPendingDeletion?.title ?? "",
        })}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelDeleteQuiz}
              disabled={isProcessing}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDeleteQuiz}
              disabled={isProcessing}
            >
              {isProcessing ? t("common.loading") : t("admin.confirmDelete")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-light-200">
          {t("admin.deleteQuizModalWarning")}
        </p>
      </Modal>
    </div>
  );
}
