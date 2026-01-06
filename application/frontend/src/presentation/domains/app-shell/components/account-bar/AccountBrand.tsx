import { memo, useMemo } from "react";

import { Icon } from "../../../../../presentation/shared/ui/icons";

const BRAND_BUTTON_CLASSES =
  "flex items-center gap-3 rounded-3xl border border-primary-500/35 bg-primary-100/70 px-4 py-2 text-left shadow-neon transition-transform hover:-translate-y-0.5 hover:border-primary-400/60 hover:bg-primary-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-light-50 dark:border-primary-500/40 dark:bg-primary-500/20 dark:hover:bg-primary-500/30 dark:focus-visible:ring-primary-400 dark:focus-visible:ring-offset-dark-900";
const BRAND_ICON_WRAPPER_CLASSES =
  "hidden h-10 w-10 items-center justify-center rounded-full border border-primary-500/30 bg-primary-200/70 text-primary-900 md:flex dark:border-primary-400/40 dark:bg-primary-500/30 dark:text-primary-100";
const BRAND_TEXT_STACK_CLASSES = "flex flex-col gap-0.5";
const BRAND_TITLE_CLASSES =
  "font-display text-xs uppercase tracking-[0.5em] text-primary-900 dark:text-primary-100";
const BRAND_SUBTITLE_CLASSES =
  "text-[0.6rem] uppercase tracking-[0.45em] text-dark-400 dark:text-light-400";

interface AccountBrandProps {
  title: string;
  subtitle?: string;
  onNavigateHome: () => void;
}

function AccountBrandComponent({
  title,
  subtitle,
  onNavigateHome,
}: AccountBrandProps) {
  const ariaLabel = useMemo(
    () => (subtitle ? `${title} – ${subtitle}` : title),
    [subtitle, title]
  );

  return (
    <button
      type="button"
      onClick={onNavigateHome}
      aria-label={ariaLabel}
      className={BRAND_BUTTON_CLASSES}
      data-account-brand="true"
    >
      <div className={BRAND_ICON_WRAPPER_CLASSES} aria-hidden="true">
        <Icon name="Gamepad2" tone="accent" size={22} strokeWidth={1.75} />
      </div>
      <div className={BRAND_TEXT_STACK_CLASSES}>
        <span className={BRAND_TITLE_CLASSES}>{title}</span>
        {subtitle ? (
          <span className={BRAND_SUBTITLE_CLASSES}>{subtitle}</span>
        ) : null}
      </div>
    </button>
  );
}

export const AccountBrand = memo(AccountBrandComponent);
