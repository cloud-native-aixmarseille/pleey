import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { composeClasses } from "../../utils/composeClasses";

const SIZE_CLASS_MAP = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20 sm:h-24 sm:w-24",
} as const;

export type PleeyLogoSize = keyof typeof SIZE_CLASS_MAP;

export interface PleeyLogoProps {
  size?: PleeyLogoSize;
  className?: string;
  decorative?: boolean;
  src?: string;
}

function PleeyLogoComponent({
  size = "md",
  className,
  decorative = false,
  src = "/brand/pleey-logo.png",
}: PleeyLogoProps) {
  const { t } = useTranslation();

  const altText = useMemo(() => {
    if (decorative) {
      return "";
    }

    return t("branding.logoAlt", "Pleey logo");
  }, [decorative, t]);

  return (
    <img
      src={src}
      alt={altText}
      aria-hidden={decorative}
      className={composeClasses(
        "block object-contain",
        SIZE_CLASS_MAP[size],
        className,
      )}
      loading="eager"
      decoding="async"
    />
  );
}

export const PleeyLogo = memo(PleeyLogoComponent);
