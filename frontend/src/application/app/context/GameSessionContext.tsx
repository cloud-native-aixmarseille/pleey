import { createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSessionManager } from "../hooks/useGameSessionManager";
import { useAuthManagerContext } from "./AuthManagerContext";
import { useQuizManagerContext } from "./QuizManagerContext";
import { useGuestSessionContext } from "./GuestSessionContext";
import { useNotifications } from "../hooks/useNotifications";

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
    registerGuest: guest.registerGuest,
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
