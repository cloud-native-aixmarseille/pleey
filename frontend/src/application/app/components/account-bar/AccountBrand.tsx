import { memo } from "react";

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
  return (
    <button
      type="button"
      onClick={onNavigateHome}
      className="flex items-center gap-3 rounded-3xl border border-primary-500/40 bg-primary-500/20 px-4 py-2 text-left shadow-neon hover:border-primary-400/60 hover:bg-primary-500/30"
    >
      <div className="hidden md:flex">
        <span className="text-2xl">🎮</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-xs uppercase tracking-[0.5em] text-primary-100">
          {title}
        </span>
        <span className="text-[0.6rem] uppercase tracking-[0.45em] text-light-400">
          {subtitle}
        </span>
      </div>
    </button>
  );
}

export const AccountBrand = memo(AccountBrandComponent);
