import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button, LanguageSwitcher } from "../../../../shared/components";
import { Icon } from "../../../../shared/ui/icons";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("AccountMenu", {
  slot1: "relative",
  slot3: "sr-only",
  slot4:
    "absolute right-0 mt-2 min-w-[12rem] space-y-2 rounded-2xl border border-primary-500/30 bg-dark-500/95 p-3 shadow-neon",
  slot5: "border-b border-primary-500/20 pb-2",
  slot6: "w-full justify-between",
  slot7:
    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-light-100 transition-colors hover:bg-primary-500/20 hover:text-primary-100",
  slot8:
    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-light-100 transition-colors hover:bg-danger-500/20 hover:text-danger-100",
});

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
    <div {...styles.slot1} ref={menuRef}>
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
        <span {...styles.slot3}>{labels.accountMenu}</span>
      </Button>
      {isOpen && (
        <div role="menu" {...styles.slot4}>
          <div {...styles.slot5}>
            <LanguageSwitcher variant="inline" {...styles.slot6} />
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleProfile}
            {...styles.slot7}
          >
            <Icon name="UserRound" size={20} strokeWidth={1.5} tone="accent" />
            {labels.profile}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            {...styles.slot8}
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
