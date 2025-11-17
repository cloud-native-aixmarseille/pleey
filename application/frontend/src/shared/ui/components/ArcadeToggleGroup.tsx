import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { composeClasses } from "../utils/composeClasses";
import type { ArcadeBadgeTone } from "./ArcadeBadge";

type ArcadeToggleSize = "sm" | "md";

type ToggleTone = ArcadeBadgeTone;

const GROUP_BASE_CLASSES = "flex flex-wrap gap-3";

const SIZE_CLASS_MAP: Record<ArcadeToggleSize, string> = {
  sm: "px-4 py-2 text-[0.65rem]",
  md: "px-5 py-2.5 text-xs",
};

const BASE_BUTTON_CLASSES = composeClasses(
  "group relative inline-flex items-center gap-2 rounded-2xl border",
  "font-semibold uppercase tracking-[0.2em] transition-all duration-200",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-dark-700"
);

const ACTIVE_TONE_CLASS_MAP: Record<ToggleTone, string> = {
  primary: "border-primary-400 bg-primary-500/20 text-primary-100 shadow-glow",
  secondary:
    "border-secondary-400 bg-secondary-500/20 text-secondary-100 shadow-glow",
  accent: "border-accent-400 bg-accent-500/20 text-accent-100 shadow-glow",
  success: "border-success-400 bg-success-500/20 text-success-100 shadow-glow",
  danger: "border-danger-400 bg-danger-500/20 text-danger-100 shadow-glow",
  neutral: "border-dark-400 bg-dark-500/40 text-light-100 shadow-glow",
};

const INACTIVE_TONE_CLASS_MAP: Record<ToggleTone, string> = {
  primary:
    "border-primary-500/20 bg-dark-500/40 text-light-400 hover:border-primary-400/40 hover:text-light-100",
  secondary:
    "border-secondary-500/20 bg-dark-500/40 text-light-400 hover:border-secondary-400/40 hover:text-light-100",
  accent:
    "border-accent-500/20 bg-dark-500/40 text-light-300 hover:border-accent-400/40 hover:text-light-100",
  success:
    "border-success-500/25 bg-dark-500/40 text-light-300 hover:border-success-400/40 hover:text-light-100",
  danger:
    "border-danger-500/25 bg-dark-500/40 text-light-300 hover:border-danger-400/40 hover:text-light-100",
  neutral:
    "border-dark-500/45 bg-dark-700/60 text-light-300 hover:border-dark-400/40 hover:text-light-100",
};

export interface ArcadeToggleOption<T extends string> {
  value: T;
  label: ReactNode;
  tone?: ToggleTone;
  icon?: ReactNode;
}

export interface ArcadeToggleGroupProps<T extends string>
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onChange"> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: Array<ArcadeToggleOption<T>>;
  size?: ArcadeToggleSize;
  multiSelect?: boolean;
}

export function ArcadeToggleGroup<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  multiSelect = false,
  className,
  ...rest
}: ArcadeToggleGroupProps<T>) {
  const selectedValues = multiSelect && value ? value.split(',').map(v => v.trim()) : [value];

  const handleClick = (optionValue: T) => {
    if (!multiSelect) {
      onChange(optionValue);
      return;
    }

    // Multi-select logic: toggle the value
    const currentValues = value ? value.split(',').map(v => v.trim() as T) : [];
    const isSelected = currentValues.includes(optionValue);

    let newValues: T[];
    if (isSelected) {
      // Remove the value
      newValues = currentValues.filter(v => v !== optionValue);
    } else {
      // Add the value
      newValues = [...currentValues, optionValue];
    }

    // Sort values alphabetically for consistency
    newValues.sort();

    onChange((newValues.length > 0 ? newValues.join(',') : null) as T | null);
  };

  return (
    <div
      {...rest}
      className={composeClasses(GROUP_BASE_CLASSES, className)}
      role={multiSelect ? "group" : "radiogroup"}
    >
      {options.map((option) => {
        const isActive = selectedValues.includes(option.value);
        const tone = option.tone ?? "neutral";
        const buttonClassName = composeClasses(
          BASE_BUTTON_CLASSES,
          SIZE_CLASS_MAP[size],
          isActive ? ACTIVE_TONE_CLASS_MAP[tone] : INACTIVE_TONE_CLASS_MAP[tone]
        );

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            className={buttonClassName}
            role={multiSelect ? "checkbox" : "radio"}
            aria-checked={isActive}
            data-active={isActive ? "true" : "false"}
          >
            {option.icon ? (
              <span aria-hidden className="text-lg leading-none">
                {option.icon}
              </span>
            ) : null}
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ArcadeToggleGroup;
