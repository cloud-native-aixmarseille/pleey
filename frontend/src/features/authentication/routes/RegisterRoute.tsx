import { useNavigate } from "react-router-dom";
import RegisterPage from "../components/RegisterPage";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

export function RegisterRoute() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { register } = useAuthManagerContext();

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await register({ username, email, password });
      notifications.notify("errors.registrationSuccess", "success");
      navigate("/auth/login", { replace: true });
    } catch (error) {
      notifications.notifyFromError(error, "errors.registrationError");
    }
  };

  return <RegisterPage onRegister={handleRegister} />;
}
