import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Button, LanguageSwitcher } from "../../../shared/components";
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

  const handleLogout = useCallback(() => {
    clearSession();
    navigate("/auth/login", { replace: true });
  }, [clearSession, navigate]);

  const navigationItems = useMemo(() => {
    if (!user) {
      return [] as Array<{ key: string; label: string; path: string }>;
    }

    const items: Array<{ key: string; label: string; path: string }> = [
      {
        key: "home",
        label: t("navigation.home", "Home"),
        path: "/",
      },
      {
        key: "join",
        label: t("navigation.joinGame", "Join Game"),
        path: "/game/join",
      },
    ];

    if (user.isAdmin) {
      items.push(
        {
          key: "admin",
          label: t("navigation.admin", "Dashboard"),
          path: "/admin",
        },
        {
          key: "organizations",
          label: t("navigation.organizations", "Organizations"),
          path: "/admin/organization",
        }
      );
    }

    return items;
  }, [t, user]);

  const isActivePath = useCallback(
    (path: string) => {
      if (path === "/") {
        return location.pathname === "/";
      }

      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <nav className="pointer-events-none fixed left-1/2 top-4 z-50 w-[min(95vw,1100px)] -translate-x-1/2 px-4">
      <div className="pointer-events-auto flex flex-col gap-4 rounded-4xl border border-primary-500/40 bg-dark-500/80 px-5 py-4 shadow-neon backdrop-blur-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-3 rounded-3xl border border-primary-500/40 bg-primary-500/20 px-4 py-2 text-left shadow-neon hover:border-primary-400/60 hover:bg-primary-500/30"
            >
              <div className="hidden md:flex">
                <span className="text-2xl">🎮</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xs uppercase tracking-[0.5em] text-primary-100">
                  {t("home.title")}
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.45em] text-light-400">
                  {t("home.subtitle")}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-primary-500/20 bg-dark-500/40 px-2 py-2">
              {navigationItems.map((item) => {
                const active = isActivePath(item.path);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                      active
                        ? "bg-primary-500 text-light-50 shadow-glow"
                        : "text-light-400 hover:bg-primary-500/15 hover:text-light-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <LanguageSwitcher
              variant="inline"
              className="self-start sm:self-auto"
            />
            <div className="flex items-center gap-3 rounded-3xl border border-primary-500/20 bg-dark-500/60 px-4 py-2">
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
                className="font-semibold uppercase tracking-[0.2em]"
              >
                {t("profile.title")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="font-semibold uppercase tracking-[0.2em]"
              >
                {t("common.logout")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
