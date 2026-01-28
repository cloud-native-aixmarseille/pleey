import type React from 'react';
import { usePresentationTranslation } from '../../i18n/use-presentation-translation';

const logoSizeMap = {
  sm: '2rem',
  md: '2.5rem',
  lg: '3.5rem',
  xl: '6rem',
} as const;

type PleeyLogoSize = keyof typeof logoSizeMap;

interface PleeyLogoProps {
  readonly size?: PleeyLogoSize;
  readonly decorative?: boolean;
  readonly src?: string;
  readonly style?: React.CSSProperties;
  readonly className?: string;
}

export function PleeyLogo({
  size = 'md',
  decorative = false,
  src = '/brand/pleey-logo.png',
  style,
  className,
}: PleeyLogoProps) {
  const { t } = usePresentationTranslation();
  const dimension = logoSizeMap[size];

  return (
    <img
      alt={decorative ? '' : t('shared.branding.logoAlt')}
      aria-hidden={decorative}
      className={className}
      decoding="async"
      height={dimension}
      loading="eager"
      src={src}
      style={{
        display: 'block',
        height: dimension,
        objectFit: 'contain',
        width: dimension,
        ...style,
      }}
      width={dimension}
    />
  );
}
