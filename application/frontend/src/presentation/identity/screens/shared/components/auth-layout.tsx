import type { PropsWithChildren } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { PleeyLogo } from '../../../../shared/ui/branding/pleey-logo';
import {
  AUTH_LAYOUT_RESPONSIVE_CSS,
  authBrandingFeatureItemStyle,
  authBrandingFeatureListStyle,
  authLayoutBackdropStyle,
  authLayoutBrandingPanelStyle,
  authLayoutContentPanelStyle,
  authLayoutRootStyle,
  authLayoutShellStyle,
  authLayoutTaglineStyle,
  uiThemeTokens,
} from '../../../../shared/ui/foundation/ui-theme';
import { PatienceOverlay, PatiencePlayground, useUserIdle } from '../../../../shared/ui/patience';

interface AuthLayoutProps extends PropsWithChildren {
  readonly brandingTitle?: string;
}

const featureCheckColor = uiThemeTokens.color.brand.success;
const checkPath =
  'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z';

function FeatureCheck() {
  return (
    <svg aria-hidden="true" fill={featureCheckColor} height="16" viewBox="0 0 16 16" width="16">
      <path d={checkPath} />
    </svg>
  );
}

export function AuthLayout({ children, brandingTitle }: AuthLayoutProps) {
  const { t } = usePresentationTranslation();
  const isIdle = useUserIdle(true, 10_000);

  return (
    <PatiencePlayground>
      <style>{AUTH_LAYOUT_RESPONSIVE_CSS}</style>
      <div data-auth-layout style={authLayoutRootStyle}>
        <div aria-hidden="true" style={authLayoutBackdropStyle} />

        <main data-auth-shell style={authLayoutShellStyle}>
          <div style={authLayoutBrandingPanelStyle}>
            <PleeyLogo decorative size="lg" />
            <span data-auth-eyebrow style={authLayoutTaglineStyle}>
              {t('auth.branding.eyebrow')}
            </span>
            <p style={authLayoutTaglineStyle}>{brandingTitle ?? t('auth.branding.title')}</p>
          </div>

          <div style={authLayoutContentPanelStyle}>{children}</div>

          <ul style={authBrandingFeatureListStyle}>
            <li style={authBrandingFeatureItemStyle}>
              <FeatureCheck /> {t('auth.branding.feature1')}
            </li>
            <li style={authBrandingFeatureItemStyle}>
              <FeatureCheck /> {t('auth.branding.feature2')}
            </li>
            <li style={authBrandingFeatureItemStyle}>
              <FeatureCheck /> {t('auth.branding.feature3')}
            </li>
          </ul>
        </main>
      </div>

      <PatienceOverlay active={isIdle} delayMs={600} />
    </PatiencePlayground>
  );
}
