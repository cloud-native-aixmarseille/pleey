import { memo, useMemo } from "react";
import { Link } from "react-router-dom";

import { PleeyLogo } from "../../../../../presentation/shared/ui/components";

const BRAND_BUTTON_CLASSES =
  "flex items-center gap-3 rounded-3xl px-4 py-2 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:[box-shadow:var(--arcade-effect-focus-ring)]";
const BRAND_ICON_WRAPPER_CLASSES =
  "hidden h-10 w-10 items-center justify-center rounded-full border md:flex border-[color:color-mix(in_srgb,var(--arcade-color-primary-500)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--arcade-color-primary-500)_10%,var(--arcade-color-surface-elevated))] text-[color:var(--arcade-color-primary-400)]";
const BRAND_TEXT_STACK_CLASSES = "flex flex-col gap-0.5";
const BRAND_TITLE_CLASSES =
  "font-display text-xs uppercase tracking-[0.5em] text-[color:var(--arcade-color-primary-400)] text-neon";
const BRAND_SUBTITLE_CLASSES =
  "text-[0.6rem] uppercase tracking-[0.45em] text-[color:var(--arcade-color-text-muted)]";

interface AccountBrandProps {
  title: string;
  subtitle?: string;
  to?: string;
}

function AccountBrandComponent({
  title,
  subtitle,
  to = "/",
}: AccountBrandProps) {
  const ariaLabel = useMemo(
    () => (subtitle ? `${title} – ${subtitle}` : title),
    [subtitle, title],
  );

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={BRAND_BUTTON_CLASSES}
      data-account-brand="true"
    >
      <div className={BRAND_ICON_WRAPPER_CLASSES} aria-hidden="true">
        <PleeyLogo
          size="md"
          decorative
          className="h-9 w-9 drop-shadow-[0_0_14px_rgba(0,255,204,0.6)]"
        />
      </div>
      <div className={BRAND_TEXT_STACK_CLASSES}>
        <span className={BRAND_TITLE_CLASSES}>{title}</span>
        {subtitle ? (
          <span className={BRAND_SUBTITLE_CLASSES}>{subtitle}</span>
        ) : null}
      </div>
    </Link>
  );
}

export const AccountBrand = memo(AccountBrandComponent);
