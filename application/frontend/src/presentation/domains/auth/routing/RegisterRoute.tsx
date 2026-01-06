import { useNavigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import { useAuthManagerContext } from "../contexts/AuthManagerContext";
import { useNotifications } from "../../app-shell";

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
