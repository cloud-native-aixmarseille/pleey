import { memo, useCallback, useEffect, useRef, useState } from "react";

import { Button } from "../../../../../presentation/shared/ui/components";
import { Icon } from "../../../../../presentation/shared/ui/icons";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeSwitcher from "../ThemeSwitcher";

const ACCOUNT_MENU_CONTAINER_CLASSES = "relative";
const ACCOUNT_MENU_TRIGGER_LABEL_CLASSES = "sr-only";
const ACCOUNT_MENU_PANEL_CLASSES =
  "absolute right-0 mt-2 min-w-[12rem] space-y-2 rounded-2xl border border-primary-500/25 bg-light-50/95 p-3 text-dark-500 shadow-neon dark:border-primary-500/30 dark:bg-dark-500/95 dark:text-light-100";
const ACCOUNT_MENU_TOP_SECTION_CLASSES = "border-b border-primary-500/20 pb-2";
const ACCOUNT_MENU_LANGUAGE_SWITCHER_CLASSES = "w-full justify-between";
const ACCOUNT_MENU_THEME_SWITCHER_CLASSES = "w-full justify-between";
const ACCOUNT_MENU_ITEM_CLASSES =
  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-dark-500 transition-colors hover:bg-primary-500/15 hover:text-primary-900 dark:text-light-100 dark:hover:bg-primary-500/20 dark:hover:text-primary-100";
const ACCOUNT_MENU_LOGOUT_CLASSES =
  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-dark-500 transition-colors hover:bg-danger-500/12 hover:text-danger-900 dark:text-light-100 dark:hover:bg-danger-500/20 dark:hover:text-danger-100";

interface AccountMenuLabels {
  accountMenu: string;
  profile: string;
  logout: string;
}

interface AccountMenuProps {
  labels: AccountMenuLabels;
  onNavigateProfile: () => void;
  onLogout: () => void | Promise<void>;
  closeSignal: string;
}

function AccountMenuComponent({
  labels,
  onNavigateProfile,
  onLogout,
  closeSignal,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [closeSignal]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleProfile = useCallback(() => {
    onNavigateProfile();
    setIsOpen(false);
  }, [onNavigateProfile]);

  const handleLogout = useCallback(async () => {
    await onLogout();
    setIsOpen(false);
  }, [onLogout]);

  return (
    <div
      className={ACCOUNT_MENU_CONTAINER_CLASSES}
      ref={menuRef}
      data-account-menu="true"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tooltip={labels.accountMenu}
        icon={{ name: "EllipsisVertical", strokeWidth: 1.5 }}
      >
        <span className={ACCOUNT_MENU_TRIGGER_LABEL_CLASSES}>
          {labels.accountMenu}
        </span>
      </Button>
      {isOpen && (
        <div role="menu" className={ACCOUNT_MENU_PANEL_CLASSES}>
          <div className={ACCOUNT_MENU_TOP_SECTION_CLASSES}>
            <div className="flex flex-col gap-3">
              <LanguageSwitcher
                variant="inline"
                className={ACCOUNT_MENU_LANGUAGE_SWITCHER_CLASSES}
              />
              <ThemeSwitcher
                variant="inline"
                className={ACCOUNT_MENU_THEME_SWITCHER_CLASSES}
              />
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleProfile}
            className={ACCOUNT_MENU_ITEM_CLASSES}
          >
            <Icon name="UserRound" size={20} strokeWidth={1.5} tone="accent" />
            {labels.profile}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={ACCOUNT_MENU_LOGOUT_CLASSES}
          >
            <Icon name="LogOut" size={20} strokeWidth={1.5} tone="danger" />
            {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}

export const AccountMenu = memo(AccountMenuComponent);
