import { memo, useMemo } from "react";
import { Icon } from "../../../../shared/ui/icons";
import { createStyles } from "../../../../shared/ui/styles";

const styles = createStyles("AccountBrand", {
  slot1:
    "flex items-center gap-3 rounded-3xl border border-primary-500/40 bg-primary-500/20 px-4 py-2 text-left shadow-neon transition-transform hover:-translate-y-0.5 hover:border-primary-400/60 hover:bg-primary-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900",
  slot2:
    "hidden h-10 w-10 items-center justify-center rounded-full border border-primary-400/40 bg-primary-500/30 text-primary-100 md:flex",
  slot4: "flex flex-col gap-0.5",
  slot5: "font-display text-xs uppercase tracking-[0.5em] text-primary-100",
  slot6: "text-[0.6rem] uppercase tracking-[0.45em] text-light-400",
});

interface AccountBrandProps {
  title: string;
  subtitle: string;
  onNavigateHome: () => void;
}

function AccountBrandComponent({
  title,
  subtitle,
  onNavigateHome,
}: AccountBrandProps) {
  const ariaLabel = useMemo(() => `${title} – ${subtitle}`, [subtitle, title]);

  return (
    <button
      type="button"
      onClick={onNavigateHome}
      aria-label={ariaLabel}
      {...styles.slot1}
    >
      <div {...styles.slot2} aria-hidden="true">
        <Icon name="Gamepad2" tone="accent" size={22} strokeWidth={1.75} />
      </div>
      <div {...styles.slot4}>
        <span {...styles.slot5}>{title}</span>
        <span {...styles.slot6}>{subtitle}</span>
      </div>
    </button>
  );
}

export const AccountBrand = memo(AccountBrandComponent);
