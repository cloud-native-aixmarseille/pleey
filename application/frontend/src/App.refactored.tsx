import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./shared/context/AuthContext";
import { QuizProvider } from "./shared/context/QuizContext";
import { GameProvider } from "./shared/context/GameContext";
import { AppRoutes } from "./AppRoutes";

/**
 * Main App Component
 * Provides context providers and routing
 * Following Clean Architecture and Separation of Concerns
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <GameProvider>
            <AppRoutes />
          </GameProvider>
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
