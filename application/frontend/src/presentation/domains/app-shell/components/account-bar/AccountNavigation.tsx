import { memo } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "../../../../../presentation/shared/ui/components";

const TAB_BASE_CLASSES =
  "whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:[box-shadow:var(--arcade-effect-focus-ring)]";

const NAVIGATION_CONTAINER_CLASSES =
  "flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-2xl border px-2 py-2 text-[color:var(--arcade-color-text-primary)] bg-[color:var(--arcade-color-surface-muted)] border-[color:color-mix(in_srgb,var(--arcade-color-primary-500)_20%,transparent)]";
const TAB_ACTIVE_CLASSES = `${TAB_BASE_CLASSES} shadow-[var(--arcade-effect-glow)]`;
const TAB_INACTIVE_CLASSES = `${TAB_BASE_CLASSES} text-[color:var(--arcade-color-text-muted)] hover:text-[color:var(--arcade-color-text-primary)]`;

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
    const NavigationButton = active ? PrimaryButton : SecondaryButton;

    return (
      <NavigationButton
        key={key ?? path}
        type="button"
        onClick={() => onNavigate(path)}
        effect="flat"
        size="sm"
        className={active ? TAB_ACTIVE_CLASSES : TAB_INACTIVE_CLASSES}
      >
        {label}
      </NavigationButton>
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
