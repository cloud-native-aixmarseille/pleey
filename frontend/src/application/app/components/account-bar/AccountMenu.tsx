import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button, LanguageSwitcher } from "../../../../shared/components";

interface AccountMenuLabels {
  accountMenu: string;
  profile: string;
  logout: string;
}

interface AccountMenuProps {
  labels: AccountMenuLabels;
  onNavigateProfile: () => void;
  onLogout: () => void;
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

  const handleLogout = useCallback(() => {
    onLogout();
    setIsOpen(false);
  }, [onLogout]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        tooltip={labels.accountMenu}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5zm0 6a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        }
      >
        <span className="sr-only">{labels.accountMenu}</span>
      </Button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[12rem] space-y-2 rounded-2xl border border-primary-500/30 bg-dark-500/95 p-3 shadow-neon"
        >
          <div className="border-b border-primary-500/20 pb-2">
            <LanguageSwitcher
              variant="inline"
              className="w-full justify-between"
            />
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleProfile}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-light-100 transition-colors hover:bg-primary-500/20 hover:text-primary-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.5 20.25a8.25 8.25 0 0115 0"
              />
            </svg>
            {labels.profile}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-light-100 transition-colors hover:bg-danger-500/20 hover:text-danger-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M18 12H9m9 0l-3-3m3 3l-3 3"
              />
            </svg>
            {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}

export const AccountMenu = memo(AccountMenuComponent);
