import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Container } from "../../../../presentation/shared/ui/components";
import type { GameSession } from "../../../../domains/game/types";
import type { Quiz } from "../../../../domains/quiz/types";

import { useOrganization } from "../context/OrganizationContext";
import { useNotifications } from "../../app-shell";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { AdminLiveSessionsSection } from "./AdminLiveSessionsSection";
import { AdminStatsSection } from "./AdminStatsSection";
import { AdminQuizGrid } from "./AdminQuizGrid";
import { CreateQuizModal } from "../../quiz/components/modals/CreateQuizModal";
import { DeleteQuizModal } from "../../quiz/components/modals/DeleteQuizModal";
import { useAuthManagerContext } from "../../auth";

const DASHBOARD_WRAPPER_CLASSES =
  "min-h-[calc(100dvh-var(--app-shell-padding-top,0px)-var(--app-shell-padding-bottom,0px))] bg-game-gradient pt-0 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8";

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

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateTitle("");
    setCreateDescription("");
    setIsProcessing(false);
  }, []);

  const submitCreateQuiz = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
    },
    [
      currentOrganization,
      createTitle,
      createDescription,
      onCreateQuiz,
      notify,
      notifyFromError,
      closeCreateModal,
    ]
  );

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
      if (!liveStatuses.has(session.status)) {
        return;
      }
      if (typeof session.quizId === "number" && !map.has(session.quizId)) {
        map.set(session.quizId, session);
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
    () => quizzes.reduce((sum, quiz) => sum + (quiz.questionCount || 0), 0),
    [quizzes]
  );

  const hasHostedLiveSession = useMemo(() => {
    if (!user) {
      return false;
    }
    const hostId = user.id;
    const liveStatuses = new Set(["waiting", "active", "paused"]);
    return activeSessions.some((session) => {
      return session.hostId === hostId && liveStatuses.has(session.status);
    });
  }, [activeSessions, user]);

  const handleJoinSession = useCallback(
    async (session: GameSession) => {
      await Promise.resolve(onJoinSession(session));
    },
    [onJoinSession]
  );

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCreateTitle(event.target.value);
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setCreateDescription(event.target.value);
    },
    []
  );

  return (
    <div className={DASHBOARD_WRAPPER_CLASSES} data-admin-dashboard="true">
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
