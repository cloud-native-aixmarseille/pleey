import { memo } from "react";

const TAB_BASE_CLASSES =
  "whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-light-100 dark:focus-visible:ring-offset-dark-500";

const NAVIGATION_CONTAINER_CLASSES =
  "flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-2xl border border-primary-500/20 bg-light-50/70 px-2 py-2 text-dark-500 dark:bg-dark-500/40 dark:text-light-100";
const TAB_ACTIVE_CLASSES = `${TAB_BASE_CLASSES} bg-primary-500 text-light-50 shadow-glow`;
const TAB_INACTIVE_CLASSES = `${TAB_BASE_CLASSES} text-dark-400 hover:bg-primary-500/10 hover:text-dark-500 dark:text-light-400 dark:hover:bg-primary-500/15 dark:hover:text-light-100`;

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
}

interface AccountNavigationProps {
  items: NavigationItem[];
  isActive: (path: string) => boolean;
  onNavigate: (path: string) => void;
}

function AccountNavigationComponent({
  items,
  isActive,
  onNavigate,
}: AccountNavigationProps) {
  const renderButton = (path: string, label: string, key?: string) => {
    const active = isActive(path);

    return (
      <button
        key={key ?? path}
        type="button"
        onClick={() => onNavigate(path)}
        className={active ? TAB_ACTIVE_CLASSES : TAB_INACTIVE_CLASSES}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={NAVIGATION_CONTAINER_CLASSES}
      data-account-navigation="true"
    >
      {items.map((item) => renderButton(item.path, item.label, item.key))}
    </div>
  );
}

export const AccountNavigation = memo(AccountNavigationComponent);
