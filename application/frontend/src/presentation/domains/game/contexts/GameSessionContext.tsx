import { createContext, type ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../app-shell/hooks/useNotifications";
import { useAuthManagerContext } from "../../auth";
import { useQuizManagerContext } from "../../quiz/context/QuizManagerContext";
import { useGameSessionManager } from "../hooks/useGameSessionManager";
import { useGuestSessionContext } from "./GuestSessionContext";

const GameSessionContext = createContext<
  ReturnType<typeof useGameSessionManager> | undefined
>(undefined);

interface GameSessionProviderProps {
  children: ReactNode;
}

export function GameSessionProvider({ children }: GameSessionProviderProps) {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const auth = useAuthManagerContext();
  const quiz = useQuizManagerContext();
  const guest = useGuestSessionContext();

  const value = useGameSessionManager({
    token: auth.token,
    user: auth.user,
    guestId: guest.guestId,
    guestNickname: guest.guestNickname,
    registerGuest: guest.registerGuest,
    quizzes: quiz.quizzes,
    questionsByQuiz: quiz.questionsByQuiz,
    fetchQuizQuestions: quiz.loadQuizQuestions,
    notify: notifications.notify,
    notifyFromError: notifications.notifyFromError,
    navigate,
  });

  return (
    <GameSessionContext.Provider value={value}>
      {children}
    </GameSessionContext.Provider>
  );
}

export function useGameSessionContext() {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error(
      "useGameSessionContext must be used within a GameSessionProvider"
    );
  }
  return context;
}
