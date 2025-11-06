import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Button } from "../../../shared/components";
import { useAuthManagerContext } from "../context/AuthManagerContext";

/**
 * Fixed account toolbar for authenticated users.
 * Keeps UI concerns separated from routing logic in App shell.
 */
export function AccountBar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, clearSession } = useAuthManagerContext();

  const handleLogout = useCallback(() => {
    clearSession();
    navigate("/auth/login", { replace: true });
  }, [clearSession, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-4 bg-dark-500/80 backdrop-blur-lg border border-primary-500/30 rounded-3xl shadow-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.username} src={user.avatarUrl} size="sm" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-light-100">
              {user.username}
            </span>
            <span className="text-xs text-light-500">{user.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/profile")}
            className="font-semibold"
          >
            {t("profile.title")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="font-semibold"
          >
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
