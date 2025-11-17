import { useNavigate } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useQuizManagerContext } from "../../../application/app/context/QuizManagerContext";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

export function LoginRoute() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { login, clearSession } = useAuthManagerContext();
  const { loadQuizzes } = useQuizManagerContext();

  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password });

    if (result.user.isAdmin) {
      try {
        await loadQuizzes(result.token);
      } catch (error) {
        clearSession();
        notifications.notifyFromError(error, "errors.quizzesLoadFailed");
        return;
      }

      navigate("/admin", { replace: true });
      return;
    }

    navigate("/game/join", { replace: true });
  };

  return <LoginPage onLogin={handleLogin} />;
}
