import type { PropsWithChildren } from 'react';
import { PleeyLogo } from '../../../../shared/ui/branding/pleey-logo';
import { UserAvatar } from '../../../../shared/ui/data/user-avatar';
import {
  AUTH_LAYOUT_RESPONSIVE_CSS,
  authAccountActionsStyle,
  authBrandingFeatureItemStyle,
  authBrandingFeatureListStyle,
  authFormCardStyle,
  authLayoutBackdropStyle,
  authLayoutBrandingPanelStyle,
  authLayoutContentPanelStyle,
  authLayoutRootStyle,
  authLayoutShellStyle,
  authLayoutTaglineStyle,
  authProfileIdentityStyle,
} from './auth-shell-primitives.styles';

interface AuthBrandingPanelProps {
  readonly brandingEyebrow: string;
  readonly brandingTitle: string;
  readonly featureItems: readonly string[];
}

interface AuthFramedAvatarProps {
  readonly alt: string;
  readonly src?: string | null;
}

const featureCheckColor = 'var(--ui-color-brand-success)';
const checkPath =
  'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z';

function FeatureCheck() {
  return (
    <svg aria-hidden="true" fill={featureCheckColor} height="16" viewBox="0 0 16 16" width="16">
      <path d={checkPath} />
    </svg>
  );
}

export function AuthShellFrame({ children }: PropsWithChildren) {
  return (
    <>
      <style>{AUTH_LAYOUT_RESPONSIVE_CSS}</style>
      <div data-auth-layout style={authLayoutRootStyle}>
        <div aria-hidden="true" style={authLayoutBackdropStyle} />
        {children}
      </div>
    </>
  );
}

export function AuthShellContent({ children }: PropsWithChildren) {
  return (
    <main data-auth-shell style={authLayoutShellStyle}>
      {children}
    </main>
  );
}

export function AuthBrandingPanel({
  brandingEyebrow,
  brandingTitle,
  featureItems,
}: AuthBrandingPanelProps) {
  return (
    <>
      <div style={authLayoutBrandingPanelStyle}>
        <PleeyLogo decorative size="lg" />
        <span data-auth-eyebrow style={authLayoutTaglineStyle}>
          {brandingEyebrow}
        </span>
        <p style={authLayoutTaglineStyle}>{brandingTitle}</p>
      </div>

      <ul style={authBrandingFeatureListStyle}>
        {featureItems.map((featureItem) => (
          <li key={featureItem} style={authBrandingFeatureItemStyle}>
            <FeatureCheck />
            {featureItem}
          </li>
        ))}
      </ul>
    </>
  );
}

export function AuthContentPanel({ children }: PropsWithChildren) {
  return <div style={authLayoutContentPanelStyle}>{children}</div>;
}

export function AuthFormSurface({ children }: PropsWithChildren) {
  return <div style={authFormCardStyle}>{children}</div>;
}

export function AuthProfileIdentityPanel({ children }: PropsWithChildren) {
  return <div style={authProfileIdentityStyle}>{children}</div>;
}

export function AuthFramedAvatar({ alt, src }: AuthFramedAvatarProps) {
  return <UserAvatar alt={alt} appearance="framed" src={src} />;
}

export function AuthActionPanel({ children }: PropsWithChildren) {
  return <div style={authAccountActionsStyle}>{children}</div>;
}
