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

const ACCOUNT_BAR_CONTAINER_CLASSES =
  "pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 px-4";
const ACCOUNT_BAR_CONTAINER_ADMIN_CLASSES =
  "pointer-events-none sticky top-0 z-50 px-4 pt-4 flex justify-center";
const ACCOUNT_BAR_CONTENT_CLASSES =
  "pointer-events-auto flex flex-wrap items-center gap-4 rounded-4xl border border-primary-500/35 bg-light-50/85 px-5 py-4 text-dark-500 shadow-neon backdrop-blur-2xl dark:border-primary-500/40 dark:bg-dark-500/80 dark:text-light-100";
const ACCOUNT_BAR_ACTIONS_CLASSES = "ml-auto flex items-center gap-3";

/**
 * Fixed account toolbar for authenticated users.
 * Keeps UI concerns separated from routing logic in App shell.
 */
export function AccountBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthManagerContext();

  const isAdminPage =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");

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

      if (path === "/admin") {
        return (
          (location.pathname === "/admin" ||
            location.pathname.startsWith("/admin/quizzes")) &&
          !location.pathname.startsWith("/admin/organization")
        );
      }

      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <nav
      className={
        isAdminPage
          ? ACCOUNT_BAR_CONTAINER_ADMIN_CLASSES
          : ACCOUNT_BAR_CONTAINER_CLASSES
      }
      data-account-bar="true"
      aria-label={t("common.accountMenu", "Account menu")}
    >
      <div className={ACCOUNT_BAR_CONTENT_CLASSES}>
        <AccountBrand
          title={t("home.title")}
          onNavigateHome={() => navigate("/")}
        />

        <AccountNavigation
          items={navigationItems}
          isActive={isActivePath}
          onNavigate={navigate}
        />

        <div className={ACCOUNT_BAR_ACTIONS_CLASSES}>
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
