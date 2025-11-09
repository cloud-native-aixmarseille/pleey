import { type ReactNode } from "react";
import { composeClasses } from "../utils/composeClasses";

export interface ArcadeSectionHeaderProps {
  icon?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  leadingSlot?: ReactNode;
}

export function ArcadeSectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  leadingSlot,
}: ArcadeSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-6" data-arcade-section-header="true">
      {leadingSlot ? (
        <div className="flex items-center gap-3">{leadingSlot}</div>
      ) : null}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            {icon ? (
              <span
                className="text-4xl sm:text-5xl animate-bounce-slow"
                aria-hidden
              >
                {icon}
              </span>
            ) : null}
            <div className="space-y-3">
              {eyebrow ? (
                <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-light-400">
                  {eyebrow}
                </span>
              ) : null}
              <h2 className="text-3xl sm:text-4xl font-black text-gradient-neon">
                {title}
              </h2>
            </div>
          </div>
          {subtitle ? (
            <p className="max-w-3xl text-light-700 text-base sm:text-lg leading-relaxed">
              {subtitle}
            </p>
          ) : null}
          {meta ? (
            <div className="inline-flex items-center gap-2 glass-effect px-3 py-1 rounded-lg text-dark-700 font-semibold uppercase tracking-[0.2em] text-xs sm:text-sm">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div
            className={composeClasses(
              "w-full sm:w-auto flex flex-col sm:flex-row gap-3 sm:items-center"
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ArcadeSectionHeader;
