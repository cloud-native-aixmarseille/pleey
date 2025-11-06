import { useEffect, useMemo } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { Quiz, Question } from "./shared/types";
import { useNotifications } from "./application/app/hooks/useNotifications";
import { useAuthManager } from "./application/app/hooks/useAuthManager";
import { useQuizManager } from "./application/app/hooks/useQuizManager";
import { useGuestSession } from "./application/app/hooks/useGuestSession";
import { useAuthHandlers } from "./application/app/hooks/useAuthHandlers";
import { useAdminQuizActions } from "./application/app/hooks/useAdminQuizActions";
import { useGameSessionManager } from "./application/app/hooks/useGameSessionManager";
import { useAppLifecycle } from "./application/app/hooks/useAppLifecycle";

// Feature Components
import HomePage from "./features/home/components/HomePage";
import LoginPage from "./features/authentication/components/LoginPage";
import RegisterPage from "./features/authentication/components/RegisterPage";
import AdminDashboard from "./features/quiz-management/components/AdminDashboard";
import ManageQuestionsPage from "./features/quiz-management/components/ManageQuestionsPage";
import { OrganizationDashboard } from "./features/organization-management/components/OrganizationDashboard";
import JoinGameWithGuestPage from "./features/game-play/components/JoinGameWithGuestPage";
import LobbyPage from "./features/game-play/components/LobbyPage";
import PlayingPage from "./features/game-play/components/PlayingPage";
import LeaderboardPage from "./features/game-play/components/LeaderboardPage";
import AdminHostPlayingView from "./features/game-play/components/AdminHostPlayingView";
import AdminHostLeaderboardView from "./features/game-play/components/AdminHostLeaderboardView";

type QuestionsByQuiz = Record<number, Question[]>;

interface ManageQuestionsRouteProps {
  quizzes: Quiz[];
  questionsByQuiz: QuestionsByQuiz;
  hasLoadedQuizzes: boolean;
  loadQuizQuestions: (quizId: number) => Promise<void>;
  onAddQuestion: (questionData: Partial<Question>) => Promise<void>;
}

function ManageQuestionsRoute({
  quizzes,
  questionsByQuiz,
  hasLoadedQuizzes,
  loadQuizQuestions,
  onAddQuestion,
}: ManageQuestionsRouteProps) {
  const { quizId } = useParams();
  const numericQuizId = Number(quizId);

  useEffect(() => {
    if (!Number.isFinite(numericQuizId)) {
      return;
    }
    if (questionsByQuiz[numericQuizId]) {
      return;
    }

    loadQuizQuestions(numericQuizId).catch(() => {
      // Errors bubble up through notifications in parent scope.
    });
  }, [numericQuizId, questionsByQuiz, loadQuizQuestions]);

  const quiz = quizzes.find((item) => item.id === numericQuizId);
  const questions = questionsByQuiz[numericQuizId];

  if (!quiz) {
    if (!hasLoadedQuizzes) {
      return null;
    }
    return <Navigate to="/admin" replace />;
  }

  return (
    <ManageQuestionsPage
      quiz={quiz}
      questions={questions ?? []}
      onAddQuestion={onAddQuestion}
    />
  );
}

export default function QuizApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const notifications = useNotifications();
  const auth = useAuthManager();
  const guestSession = useGuestSession();
  const quizManager = useQuizManager();

  const gameSession = useGameSessionManager({
    token: auth.token,
    user: auth.user,
    guestId: guestSession.guestId,
    registerGuest: guestSession.registerGuest,
    questionsByQuiz: quizManager.questionsByQuiz,
    fetchQuizQuestions: quizManager.loadQuizQuestions,
    notify: notifications.notify,
    notifyFromError: notifications.notifyFromError,
    navigate,
  });

  const adminQuizActions = useAdminQuizActions({
    token: auth.token,
    createQuiz: quizManager.createQuiz,
    loadQuizzes: quizManager.loadQuizzes,
    fetchQuizQuestions: quizManager.loadQuizQuestions,
    addQuestion: quizManager.addQuestion,
    notifyFromError: notifications.notifyFromError,
    navigate,
  });

  const { handleLogin, handleRegister } = useAuthHandlers({
    login: auth.login,
    register: auth.register,
    loadQuizzes: quizManager.loadQuizzes,
    clearSession: auth.clearSession,
    notify: notifications.notify,
    notifyFromError: notifications.notifyFromError,
    navigate,
  });

  useAppLifecycle({
    restoreSession: auth.restoreSession,
    user: auth.user,
    token: auth.token,
    loadQuizzes: quizManager.loadQuizzes,
    clearSession: auth.clearSession,
    notifyFromError: notifications.notifyFromError,
    navigate,
    locationPathname: location.pathname,
    gameStarted: gameSession.gameStarted,
    gameEnded: gameSession.gameEnded,
  });

  const { user, isAuthenticated, isAdmin } = auth;
  const { guestNickname } = guestSession;
  const { quizzes, questionsByQuiz, hasLoadedQuizzes } = quizManager;
  const {
    handleLoadQuizQuestions,
    handleCreateQuiz,
    handleManageQuiz,
    handleAddQuestion,
  } = adminQuizActions;
  const {
    gamePin,
    setGamePin,
    players,
    currentQuestion,
    questionNumber,
    totalQuestions,
    timeLeft,
    answerResult,
    showResult,
    leaderboard,
    activeQuizQuestionCount,
    userAnswer,
    handleLaunchQuiz,
    handleJoinGame,
    handleJoinAsGuest,
    handleStartGame,
    handleSubmitAnswer,
    handleNextQuestion,
  } = gameSession;

  const joinRouteElement = useMemo(
    () => (
      <JoinGameWithGuestPage
        gamePin={gamePin}
        onGamePinChange={setGamePin}
        onJoinGame={handleJoinGame}
        onJoinAsGuest={handleJoinAsGuest}
        isAuthenticated={isAuthenticated}
        username={user?.username}
      />
    ),
    [
      gamePin,
      handleJoinAsGuest,
      handleJoinGame,
      isAuthenticated,
      setGamePin,
      user?.username,
    ]
  );

  const lobbyRouteElement = useMemo(() => {
    const hasPlayerIdentity = isAuthenticated || guestNickname;

    if (!hasPlayerIdentity) {
      return <Navigate to="/game/join" replace />;
    }

    return (
      <LobbyPage
        gamePin={gamePin}
        players={players}
        isAdmin={isAdmin}
        hostUserId={isAdmin && user ? user.id : null}
        hostUsername={isAdmin && user ? user.username : null}
        onStartGame={handleStartGame}
        questionCount={activeQuizQuestionCount}
      />
    );
  }, [
    activeQuizQuestionCount,
    gamePin,
    guestNickname,
    handleStartGame,
    isAdmin,
    isAuthenticated,
    players,
    user,
  ]);

  const playingRouteElement = useMemo(() => {
    const hasPlayerIdentity = isAuthenticated || guestNickname;

    if (!hasPlayerIdentity) {
      return <Navigate to="/game/join" replace />;
    }

    if (!currentQuestion) {
      return <Navigate to="/game/lobby" replace />;
    }

    if (isAdmin) {
      return (
        <AdminHostPlayingView
          currentQuestion={currentQuestion}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          timeLeft={timeLeft}
          showResult={showResult}
          answerResult={answerResult}
          onNextQuestion={handleNextQuestion}
        />
      );
    }

    return (
      <PlayingPage
        currentQuestion={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        userAnswer={userAnswer}
        showResult={showResult}
        answerResult={answerResult}
        isAdmin={isAdmin}
        onSubmitAnswer={handleSubmitAnswer}
        onNextQuestion={handleNextQuestion}
      />
    );
  }, [
    answerResult,
    currentQuestion,
    guestNickname,
    handleNextQuestion,
    handleSubmitAnswer,
    isAdmin,
    isAuthenticated,
    questionNumber,
    showResult,
    timeLeft,
    totalQuestions,
    userAnswer,
  ]);

  const leaderboardRouteElement = useMemo(() => {
    const hasPlayerIdentity = isAuthenticated || guestNickname;

    if (!hasPlayerIdentity) {
      return <Navigate to="/game/join" replace />;
    }

    if (isAdmin) {
      return <AdminHostLeaderboardView leaderboard={leaderboard} />;
    }

    return <LeaderboardPage leaderboard={leaderboard} />;
  }, [guestNickname, isAdmin, isAuthenticated, leaderboard]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route
        path="/auth/register"
        element={<RegisterPage onRegister={handleRegister} />}
      />

      <Route
        path="/admin"
        element={
          isAdmin ? (
            <AdminDashboard
              quizzes={quizzes}
              onCreateQuiz={handleCreateQuiz}
              onManageQuiz={handleManageQuiz}
              onLaunchQuiz={handleLaunchQuiz}
            />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      <Route
        path="/admin/quizzes/:quizId"
        element={
          isAdmin ? (
            <ManageQuestionsRoute
              quizzes={quizzes}
              questionsByQuiz={questionsByQuiz}
              hasLoadedQuizzes={hasLoadedQuizzes}
              loadQuizQuestions={handleLoadQuizQuestions}
              onAddQuestion={handleAddQuestion}
            />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      <Route
        path="/admin/organization"
        element={
          isAdmin ? (
            <OrganizationDashboard />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      <Route path="/game/join" element={joinRouteElement} />
      <Route path="/game/lobby" element={lobbyRouteElement} />
      <Route path="/game/playing" element={playingRouteElement} />
      <Route path="/game/leaderboard" element={leaderboardRouteElement} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
