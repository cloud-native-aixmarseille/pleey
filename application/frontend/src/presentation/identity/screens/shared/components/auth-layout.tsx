import type { PropsWithChildren } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import {
  AuthBrandingPanel,
  AuthContentPanel,
  AuthShellContent,
  AuthShellFrame,
} from './auth-shell-primitives';

interface AuthLayoutProps extends PropsWithChildren {
  readonly brandingTitle?: string;
}

export function AuthLayout({ brandingTitle, children }: AuthLayoutProps) {
  const { t } = usePresentationTranslation();
  const featureItems = [
    t('auth.branding.feature1'),
    t('auth.branding.feature2'),
    t('auth.branding.feature3'),
  ];

  return (
    <AuthShellFrame>
      <AuthShellContent>
        <AuthBrandingPanel
          brandingEyebrow={t('auth.branding.eyebrow')}
          brandingTitle={brandingTitle ?? t('auth.branding.title')}
          featureItems={featureItems}
        />
        <AuthContentPanel>{children}</AuthContentPanel>
      </AuthShellContent>
    </AuthShellFrame>
  );
}
