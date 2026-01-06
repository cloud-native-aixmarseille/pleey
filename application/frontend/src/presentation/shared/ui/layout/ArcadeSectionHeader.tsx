import { type ReactNode } from "react";
import { composeClasses } from "../../utils/composeClasses";

export interface ArcadeSectionHeaderProps {
  icon?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  leadingSlot?: ReactNode;
  align?: "start" | "center";
}

export function ArcadeSectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  leadingSlot,
  align = "start",
}: ArcadeSectionHeaderProps) {
  const alignmentClasses =
    align === "center" ? "items-center text-center" : "items-start text-left";
  const headingWrapperClasses =
    align === "center"
      ? "flex flex-col items-center gap-4"
      : "flex items-center gap-4";
  const headingTextWrapperClasses =
    align === "center" ? "space-y-3 text-center" : "space-y-3";
  const subtitleClasses =
    align === "center"
      ? "max-w-3xl text-dark-400 dark:text-light-700 text-base sm:text-lg leading-relaxed text-center"
      : "max-w-3xl text-dark-400 dark:text-light-700 text-base sm:text-lg leading-relaxed";
  const metaWrapperClasses =
    align === "center"
      ? "inline-flex items-center gap-2 glass-effect px-3 py-1 rounded-lg text-dark-500 dark:text-light-200 font-semibold uppercase tracking-[0.2em] text-xs sm:text-sm mx-auto"
      : "inline-flex items-center gap-2 glass-effect px-3 py-1 rounded-lg text-dark-500 dark:text-light-200 font-semibold uppercase tracking-[0.2em] text-xs sm:text-sm";

  return (
    <div className="flex flex-col gap-6" data-arcade-section-header="true">
      {leadingSlot ? (
        <div className="flex items-center gap-3">{leadingSlot}</div>
      ) : null}
      <div
        className={composeClasses(
          "flex flex-col gap-6 sm:flex-row",
          align === "center"
            ? "sm:items-center sm:justify-center sm:text-center"
            : "sm:items-center sm:justify-between"
        )}
      >
        <div className={composeClasses("flex-1 space-y-4", alignmentClasses)}>
          <div className={headingWrapperClasses}>
            {icon ? (
              <span
                className="text-4xl sm:text-5xl animate-bounce-slow"
                aria-hidden
              >
                {icon}
              </span>
            ) : null}
            <div className={headingTextWrapperClasses}>
              {eyebrow ? (
                <span className="block text-xs font-semibold uppercase tracking-[0.3em] text-dark-400 dark:text-light-400">
                  {eyebrow}
                </span>
              ) : null}
              <h2 className="text-3xl sm:text-4xl font-black text-dark-950 dark:text-gradient-neon">
                {title}
              </h2>
            </div>
          </div>
          {subtitle ? <p className={subtitleClasses}>{subtitle}</p> : null}
          {meta ? <div className={metaWrapperClasses}>{meta}</div> : null}
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
