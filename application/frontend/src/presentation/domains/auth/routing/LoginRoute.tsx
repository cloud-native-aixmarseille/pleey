import { useNavigate } from "react-router-dom";
import SignInPage from "../pages/SignInPage";
import { useAuthManagerContext } from "../contexts/AuthManagerContext";
import { useQuizManagerContext } from "../../quiz/context/QuizManagerContext";
import { useNotifications } from "../../app-shell";

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

  return <SignInPage onLogin={handleLogin} />;
}
