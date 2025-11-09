import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from "react";
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
import { useAuthManagerContext } from "../../../../application/app/context/AuthManagerContext";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("AdminDashboard", {
  slot1: "min-h-screen bg-game-gradient p-4 sm:p-6 lg:p-8",
});


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
  onJoinSession: (session: GameSession) => Promise<void> | void;
}

export default function AdminDashboard({
  quizzes,
  activeSessions = [],
  onCreateQuiz,
  onManageQuiz,
  onDeleteQuiz,
  onLaunchQuiz,
  onJoinSession,
}: AdminDashboardProps) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuthManagerContext();
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

  const liveSessionsByQuiz = useMemo(() => {
    const map = new Map<number, GameSession>();
    const liveStatuses = new Set(["waiting", "active", "paused"]);
    activeSessions.forEach((session) => {
      const quizId = session.quizId ?? session.quiz_id;
      if (!liveStatuses.has(session.status)) {
        return;
      }
      if (typeof quizId === "number" && !map.has(quizId)) {
        map.set(quizId, session);
      }
    });
    return map;
  }, [activeSessions]);

  const liveQuizIds = useMemo(
    () => new Set(Array.from(liveSessionsByQuiz.keys())),
    [liveSessionsByQuiz]
  );

  const activeQuizzes = useMemo(
    () => quizzes.filter((quiz) => liveSessionsByQuiz.has(quiz.id)),
    [quizzes, liveSessionsByQuiz]
  );
  const totalQuestions = useMemo(
    () => quizzes.reduce((sum, quiz) => sum + (quiz.question_count || 0), 0),
    [quizzes]
  );

  const hasHostedLiveSession = useMemo(() => {
    if (!user) {
      return false;
    }
    const adminId = user.id;
    const liveStatuses = new Set(["waiting", "active", "paused"]);
    return activeSessions.some((session) => {
      const sessionAdminId = session.adminId ?? session.admin_id;
      return sessionAdminId === adminId && liveStatuses.has(session.status);
    });
  }, [activeSessions, user]);

  const handleJoinSession = useCallback(
    async (session: GameSession) => {
      await Promise.resolve(onJoinSession(session));
    },
    [onJoinSession]
  );

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCreateTitle(event.target.value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCreateDescription(event.target.value);
  };

  return (
    <div {...styles.slot1}>
      <Container size="xl">
        <AdminDashboardHeader
          onOpenCreateModal={openCreateModal}
          isCreateDisabled={!currentOrganization}
        />
        <AdminLiveSessionsSection
          sessions={activeSessions}
          quizLookup={quizLookup}
          onJoinSession={handleJoinSession}
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
          onJoinSession={handleJoinSession}
          liveSessionsByQuiz={liveSessionsByQuiz}
          isLaunchBlocked={hasHostedLiveSession}
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
