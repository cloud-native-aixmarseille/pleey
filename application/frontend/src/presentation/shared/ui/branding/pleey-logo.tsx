import { usePresentationTranslation } from '../../i18n/use-presentation-translation';

const logoSizeMap = {
  sm: '2rem',
  md: '2.5rem',
  lg: '3.5rem',
  xl: '6rem',
} as const;

const logoGlowFilterMap = {
  accent: 'drop-shadow(0 0 24px var(--ui-color-brand-accent))',
} as const;

type PleeyLogoSize = keyof typeof logoSizeMap;
type PleeyLogoGlow = keyof typeof logoGlowFilterMap;

interface PleeyLogoProps {
  readonly size?: PleeyLogoSize;
  readonly decorative?: boolean;
  readonly glow?: PleeyLogoGlow;
  readonly src?: string;
}

export function PleeyLogo({
  size = 'md',
  decorative = false,
  glow,
  src = '/brand/pleey-logo.png',
}: PleeyLogoProps) {
  const { t } = usePresentationTranslation();
  const dimension = logoSizeMap[size];
  const glowFilter = glow ? logoGlowFilterMap[glow] : undefined;

  return (
    <img
      alt={decorative ? '' : t('shared.branding.logoAlt')}
      aria-hidden={decorative}
      decoding="async"
      height={dimension}
      loading="eager"
      src={src}
      style={{
        display: 'block',
        filter: glowFilter,
        height: dimension,
        objectFit: 'contain',
        width: dimension,
      }}
      width={dimension}
    />
  );
}
