import { useCallback, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Button } from "../../../shared/components";
import { useAuthManagerContext } from "../context/AuthManagerContext";

/**
 * Fixed account toolbar for authenticated users.
 * Keeps UI concerns separated from routing logic in App shell.
 */
export function AccountBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, clearSession } = useAuthManagerContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(() => {
    clearSession();
    navigate("/auth/login", { replace: true });
    setIsOpen(false);
  }, [clearSession, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Hide account bar during gameplay
  const hiddenPaths = ["/game/playing", "/game/leaderboard"];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (!isAuthenticated || !user || shouldHide) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      {/* Collapsed state - just the avatar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-dark-500/80 backdrop-blur-lg border border-primary-500/30 rounded-full shadow-2xl p-1 hover:border-primary-400/50 transition-all"
          aria-label="Open account menu"
        >
          <Avatar name={user.username} src={user.avatarUrl} size="sm" />
        </button>
      )}

      {/* Expanded state - full menu */}
      {isOpen && (
        <div className="flex items-center gap-4 bg-dark-500/80 backdrop-blur-lg border border-primary-500/30 rounded-3xl shadow-2xl px-5 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar name={user.username} src={user.avatarUrl} size="sm" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-light-100">
                {user.username}
              </span>
              <span className="text-xs text-light-500">{user.email}</span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate("/profile");
                setIsOpen(false);
              }}
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
      )}
    </div>
  );
}
