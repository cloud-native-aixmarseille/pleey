import { useEffect, useMemo } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./shared/context/AuthContext";
import { useQuiz } from "./shared/context/QuizContext";
import { useGame } from "./shared/context/GameContext";

// Feature Components
import HomePage from "./features/home/components/HomePage";
import LoginPage from "./features/authentication/components/LoginPage";
import RegisterPage from "./features/authentication/components/RegisterPage";
import AdminDashboard from "./features/quiz-management/components/AdminDashboard";
import { ManageQuestionsRoute } from "./features/quiz-management/components/ManageQuestionsRoute";
import { JoinGameRoute } from "./features/game-play/routes/JoinGameRoute";
import { LobbyRoute } from "./features/game-play/routes/LobbyRoute";
import { PlayingRoute } from "./features/game-play/routes/PlayingRoute";
import { LeaderboardRoute } from "./features/game-play/routes/LeaderboardRoute";

/**
 * Application Routes
 * Handles all routing logic
 * Following Single Responsibility Principle
 */
export function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAdmin, login, register } = useAuth();
  const {
    quizzes,
    questionsByQuiz,
    hasLoadedQuizzes,
    loadQuizzes,
    loadQuizQuestions,
    createQuiz,
    addQuestion,
  } = useQuiz();
  const { gameStarted, gameEnded } = useGame();

  // Auto-redirect based on game state
  useEffect(() => {
    if (gameStarted) {
      navigate("/game/playing");
    }
  }, [gameStarted, navigate]);

  useEffect(() => {
    if (gameEnded) {
      navigate("/game/leaderboard");
    }
  }, [gameEnded, navigate]);

  // Load quizzes when admin logs in
  useEffect(() => {
    if (user?.isAdmin && token && quizzes.length === 0 && !hasLoadedQuizzes) {
      loadQuizzes(token).catch(() => {
        // Failed to load quizzes, redirect to login
        navigate("/auth/login", { replace: true });
      });
    }
  }, [user, token, quizzes.length, hasLoadedQuizzes, loadQuizzes, navigate]);

  // Auto-redirect after login
  useEffect(() => {
    if (
      user &&
      (location.pathname === "/" || location.pathname.startsWith("/auth"))
    ) {
      if (user.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/game/join", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage onLogin={login} />} />
      <Route
        path="/auth/register"
        element={<RegisterPage onRegister={register} />}
      />

      <Route
        path="/admin"
        element={
          isAdmin ? (
            <AdminDashboard
              quizzes={quizzes}
              onCreateQuiz={createQuiz}
              onManageQuiz={loadQuizQuestions}
              onLaunchQuiz={() => {}}
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
              loadQuizQuestions={loadQuizQuestions}
              onAddQuestion={addQuestion}
            />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      <Route path="/game/join" element={<JoinGameRoute />} />
      <Route path="/game/lobby" element={<LobbyRoute />} />
      <Route path="/game/playing" element={<PlayingRoute />} />
      <Route path="/game/leaderboard" element={<LeaderboardRoute />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
