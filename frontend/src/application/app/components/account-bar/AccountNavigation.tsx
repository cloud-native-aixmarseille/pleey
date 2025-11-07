import { memo } from "react";

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
        className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
          active
            ? "bg-primary-500 text-light-50 shadow-glow"
            : "text-light-400 hover:bg-primary-500/15 hover:text-light-100"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-2xl border border-primary-500/20 bg-dark-500/40 px-2 py-2">
      {items.map((item) => renderButton(item.path, item.label, item.key))}
    </div>
  );
}

export const AccountNavigation = memo(AccountNavigationComponent);
