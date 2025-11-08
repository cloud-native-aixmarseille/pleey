import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Container } from "../../../../shared/components";
import type { GameSession, Quiz } from "../../../../shared/types";
import { useOrganization } from "../../../../shared/context/OrganizationContext";
import { useNotifications } from "../../../../application/app/hooks/useNotifications";
import { AdminDashboardHeader } from "./AdminDashboardHeader.tsx";
import { AdminLiveSessionsSection } from "./AdminLiveSessionsSection.tsx";
import { AdminStatsSection } from "./AdminStatsSection.tsx";
import { AdminQuizGrid } from "./AdminQuizGrid.tsx";
import { CreateQuizModal } from "./modals/CreateQuizModal.tsx";
import { DeleteQuizModal } from "./modals/DeleteQuizModal.tsx";

interface AdminDashboardProps {
  quizzes: Quiz[];
  activeSessions: GameSession[];
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
  activeSessions = [],
  onCreateQuiz,
  onManageQuiz,
  onDeleteQuiz,
  onLaunchQuiz,
}: AdminDashboardProps) {
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

  const submitCreateQuiz = async (event: FormEvent<HTMLFormElement>) => {
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

  const quizLookup = useMemo(() => {
    const map = new Map<number, Quiz>();
    quizzes.forEach((quiz) => {
      map.set(quiz.id, quiz);
    });
    return map;
  }, [quizzes]);

  const liveQuizIds = useMemo(() => {
    const ids = new Set<number>();
    activeSessions.forEach((session) => {
      const quizId = session.quizId ?? session.quiz_id;
      if (typeof quizId === "number") {
        ids.add(quizId);
      }
    });
    return ids;
  }, [activeSessions]);

  const activeQuizzes = useMemo(
    () => quizzes.filter((quiz) => liveQuizIds.has(quiz.id)),
    [quizzes, liveQuizIds]
  );
  const totalQuestions = useMemo(
    () => quizzes.reduce((sum, quiz) => sum + (quiz.question_count || 0), 0),
    [quizzes]
  );

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCreateTitle(event.target.value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCreateDescription(event.target.value);
  };

  return (
    <div className="min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8">
      <Container size="xl">
        <AdminDashboardHeader
          onOpenCreateModal={openCreateModal}
          isCreateDisabled={!currentOrganization}
        />
        <AdminLiveSessionsSection
          sessions={activeSessions}
          quizLookup={quizLookup}
          onManageQuiz={onManageQuiz}
        />
        <AdminStatsSection
          totalQuizzes={quizzes.length}
          activeQuizCount={activeQuizzes.length}
          totalQuestions={totalQuestions}
        />
        <AdminQuizGrid
          quizzes={quizzes}
          liveQuizIds={liveQuizIds}
          onManageQuiz={onManageQuiz}
          onDeleteQuizRequest={requestDeleteQuiz}
          onLaunchQuiz={onLaunchQuiz}
          onCreateQuizRequest={openCreateModal}
        />
      </Container>
      <CreateQuizModal
        isOpen={isCreateModalOpen}
        isProcessing={isProcessing}
        title={createTitle}
        description={createDescription}
        onClose={closeCreateModal}
        onSubmit={submitCreateQuiz}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />

      <DeleteQuizModal
        quiz={quizPendingDeletion}
        isProcessing={isProcessing}
        onCancel={cancelDeleteQuiz}
        onConfirm={confirmDeleteQuiz}
      />
    </div>
  );
}
