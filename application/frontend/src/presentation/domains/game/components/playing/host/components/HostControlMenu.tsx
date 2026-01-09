import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DangerButton,
  SecondaryButton,
} from "../../../../../../../presentation/shared/ui/components";

const MENU_CONTAINER_CLASSES = "relative";
const MENU_PANEL_CLASSES =
  "absolute right-0 mt-2 min-w-[14rem] space-y-1 rounded-[var(--arcade-radius-sm)] border border-primary-500/25 bg-light-50/95 p-2 text-dark-500 shadow-[var(--arcade-effect-glow)] dark:border-primary-500/30 dark:bg-dark-500/95 dark:text-light-100 animate-scale-in origin-top-right z-50";
const MENU_DIVIDER_CLASSES = "my-1 border-t border-primary-500/20";

interface HostControlMenuProps {
  isPaused: boolean;
  className?: string;
  onBackToLobby: () => void;
  onBackToAdmin: () => void;
  onTogglePause: () => void;
}

function HostControlMenuComponent({
  isPaused,
  className,
  onBackToLobby,
  onBackToAdmin,
  onTogglePause,
}: HostControlMenuProps) {
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

  const handleAction = useCallback(
    (action: () => void) => () => {
      setIsOpen(false);
      action();
    },
    []
  );

  const label = t("game.hostControlMenu.menuLabel");

  return (
    <div className={className}>
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
          {label}
        </SecondaryButton>

        {isOpen ? (
          <div role="menu" className={MENU_PANEL_CLASSES}>
            <SecondaryButton
              type="button"
              role="menuitem"
              effect="flat"
              size="sm"
              fullWidth
              alignment="start"
              icon={{ name: isPaused ? "Play" : "Pause", strokeWidth: 1.75 }}
              onClick={handleAction(onTogglePause)}
            >
              {isPaused
                ? t("game.hostControlMenu.resumeGame")
                : t("game.hostControlMenu.pauseGame")}
            </SecondaryButton>

            <div className={MENU_DIVIDER_CLASSES} role="separator" />

            <SecondaryButton
              type="button"
              role="menuitem"
              effect="flat"
              size="sm"
              fullWidth
              alignment="start"
              icon={{ name: "House", strokeWidth: 1.75 }}
              onClick={handleAction(onBackToLobby)}
            >
              {t("game.hostControlMenu.backToLobby")}
            </SecondaryButton>

            <SecondaryButton
              type="button"
              role="menuitem"
              effect="flat"
              size="sm"
              fullWidth
              alignment="start"
              icon={{ name: "Settings", strokeWidth: 1.75 }}
              onClick={handleAction(onBackToAdmin)}
            >
              {t("game.hostControlMenu.backToAdmin")}
            </SecondaryButton>

            <div className={MENU_DIVIDER_CLASSES} role="separator" />

            <DangerButton
              type="button"
              role="menuitem"
              effect="flat"
              size="sm"
              fullWidth
              alignment="start"
              icon={{ name: "CircleStop", strokeWidth: 1.75 }}
              onClick={handleAction(onBackToAdmin)}
            >
              {t("game.hostControlMenu.endGame")}
            </DangerButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const HostControlMenu = memo(HostControlMenuComponent);
