import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ProfilePage from "../components/ProfilePage";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";
import { useNotifications } from "../../../application/app/hooks/useNotifications";

/**
 * Route container for the profile page. Bridges presentation component with
 * domain services via context hooks.
 */
export function ProfileRoute() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { user, isAuthenticated, updateProfile, regenerateAvatar } =
    useAuthManagerContext();

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = useCallback(
    async (updates: { username: string; email: string }) => {
      setIsSaving(true);
      try {
        await updateProfile(updates);
        notifications.notify("profile.updateSuccess", "success");
      } catch (error) {
        notifications.notifyFromError(error, "profile.updateError");
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [notifications, updateProfile]
  );

  const handleRegenerateAvatar = useCallback(async () => {
    try {
      await regenerateAvatar();
      notifications.notify("profile.avatarRegenerateSuccess", "success");
    } catch (error) {
      notifications.notifyFromError(error, "profile.avatarRegenerateError");
      throw error;
    }
  }, [notifications, regenerateAvatar]);

  const handleBack = useCallback(() => {
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (user.isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  }, [navigate, user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <ProfilePage
      user={user}
      onSubmit={handleSubmit}
      onRegenerateAvatar={handleRegenerateAvatar}
      onBack={handleBack}
      isSaving={isSaving}
    />
  );
}
