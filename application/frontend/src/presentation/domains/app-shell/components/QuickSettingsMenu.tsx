import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { SecondaryButton } from "../../../shared/ui/components";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";

const MENU_CONTAINER_CLASSES = "relative";
const MENU_TRIGGER_LABEL_CLASSES = "sr-only";
const MENU_PANEL_CLASSES =
  "absolute right-0 mt-2 min-w-[12rem] space-y-2 rounded-[var(--arcade-radius-sm)] border border-primary-500/25 bg-light-50/95 p-3 text-dark-500 shadow-[var(--arcade-effect-glow)] dark:border-primary-500/30 dark:bg-dark-500/95 dark:text-light-100 animate-scale-in origin-top-right";

const MENU_TOP_SECTION_CLASSES = "flex flex-col gap-3";
const MENU_LANGUAGE_SWITCHER_CLASSES = "w-full justify-between";
const MENU_THEME_SWITCHER_CLASSES = "w-full justify-between";

interface QuickSettingsMenuProps {
  className?: string;
}

function QuickSettingsMenuComponent({ className }: QuickSettingsMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const label = t("common.quickSettings.label");

  return (
    <div className={className} data-quick-settings="true">
      <div className={MENU_CONTAINER_CLASSES} ref={menuRef}>
        <SecondaryButton
          type="button"
          size="sm"
          effect="flat"
          onClick={toggleMenu}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          tooltip={label}
          icon={{ name: "EllipsisVertical", strokeWidth: 1.5 }}
        >
          <span className={MENU_TRIGGER_LABEL_CLASSES}>{label}</span>
        </SecondaryButton>

        {isOpen ? (
          <div role="menu" className={MENU_PANEL_CLASSES}>
            <div className={MENU_TOP_SECTION_CLASSES}>
              <LanguageSwitcher
                variant="inline"
                className={MENU_LANGUAGE_SWITCHER_CLASSES}
              />
              <ThemeSwitcher
                variant="inline"
                className={MENU_THEME_SWITCHER_CLASSES}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const QuickSettingsMenu = memo(QuickSettingsMenuComponent);
