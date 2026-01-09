import { memo, useCallback, useEffect, useRef, useState } from "react";

import {
  DangerButton,
  SecondaryButton,
} from "../../../../../presentation/shared/ui/components";
import LanguageSwitcher from "../LanguageSwitcher";
import ThemeSwitcher from "../ThemeSwitcher";

const ACCOUNT_MENU_CONTAINER_CLASSES = "relative";
const ACCOUNT_MENU_TRIGGER_LABEL_CLASSES = "sr-only";
const ACCOUNT_MENU_PANEL_CLASSES =
  "absolute right-0 mt-2 min-w-[12rem] space-y-2 rounded-[var(--arcade-radius-sm)] border p-3 shadow-[var(--arcade-effect-glow)] text-[color:var(--arcade-color-text-primary)] bg-[color:var(--arcade-color-surface-overlay)] border-[color:color-mix(in_srgb,var(--arcade-color-primary-500)_25%,transparent)]";
const ACCOUNT_MENU_TOP_SECTION_CLASSES =
  "border-b pb-2 border-[color:color-mix(in_srgb,var(--arcade-color-primary-500)_20%,transparent)]";
const ACCOUNT_MENU_LANGUAGE_SWITCHER_CLASSES = "w-full justify-between";
const ACCOUNT_MENU_THEME_SWITCHER_CLASSES = "w-full justify-between";

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
      <SecondaryButton
        type="button"
        size="sm"
        effect="flat"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tooltip={labels.accountMenu}
        icon={{ name: "EllipsisVertical", strokeWidth: 1.5 }}
      >
        <span className={ACCOUNT_MENU_TRIGGER_LABEL_CLASSES}>
          {labels.accountMenu}
        </span>
      </SecondaryButton>
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
          <SecondaryButton
            type="button"
            role="menuitem"
            onClick={handleProfile}
            effect="flat"
            size="sm"
            alignment="start"
            fullWidth
            icon={{ name: "UserRound" }}
          >
            {labels.profile}
          </SecondaryButton>
          <DangerButton
            type="button"
            role="menuitem"
            onClick={handleLogout}
            effect="flat"
            size="sm"
            alignment="start"
            fullWidth
            icon={{ name: "LogOut" }}
          >
            {labels.logout}
          </DangerButton>
        </div>
      )}
    </div>
  );
}

export const AccountMenu = memo(AccountMenuComponent);
