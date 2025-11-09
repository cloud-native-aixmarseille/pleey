import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthManagerContext } from "../context/AuthManagerContext";
import {
  AccountBrand,
  AccountMenu,
  AccountNavigation,
  AccountUserSummary,
  NavigationItem,
} from "./account-bar";

/**
 * Fixed account toolbar for authenticated users.
 * Keeps UI concerns separated from routing logic in App shell.
 */
export function AccountBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthManagerContext();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  }, [logout, navigate]);

  const navigationItems = useMemo(() => {
    if (!user) {
      return [] as NavigationItem[];
    }

    const items: NavigationItem[] = [];

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

    items.push({
      key: "join",
      label: t("navigation.joinGame", "Join Game"),
      path: "/game/join",
    });

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
    <nav className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 px-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-4 rounded-4xl border border-primary-500/40 bg-dark-500/80 px-5 py-4 shadow-neon backdrop-blur-2xl">
        <AccountBrand
          title={t("home.title")}
          subtitle={t("home.subtitle")}
          onNavigateHome={() => navigate("/")}
        />

        <AccountNavigation
          items={navigationItems}
          isActive={isActivePath}
          onNavigate={navigate}
        />

        <div className="ml-auto flex items-center gap-3">
          <AccountUserSummary
            username={user.username}
            email={user.email}
            avatarUrl={user.avatarUrl ?? undefined}
          />
          <AccountMenu
            labels={{
              accountMenu: t("common.accountMenu", "Account menu"),
              profile: t("profile.title"),
              logout: t("common.logout"),
            }}
            onNavigateProfile={() => navigate("/profile")}
            onLogout={handleLogout}
            closeSignal={location.pathname}
          />
        </div>
      </div>
    </nav>
  );
}
