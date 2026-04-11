import { Burger, Drawer } from '@mantine/core';
import type { UseDisclosureHandlers } from '@mantine/hooks';
import { usePresentationTranslation } from '../i18n/use-presentation-translation';
import { ColorSchemeToggle } from '../ui/actions/color-scheme-toggle';
import { LanguageToggle } from '../ui/actions/language-toggle';
import { PleeyLogo } from '../ui/branding/pleey-logo';
import { surfaceRecipes } from '../ui/foundation/ui-recipes';
import { uiThemeTokens } from '../ui/foundation/ui-theme';
import { uiTypeScale } from '../ui/foundation/ui-typography';
import { AppIcon } from '../ui/icons/app-icon';
import { AccountMenu } from '../ui/navigation/account-menu/account-menu';
import { BrandLink, NavPillLink } from '../ui/navigation/links';

const shellHeaderStyle = {
  ...surfaceRecipes.elevated,
  borderBottom: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderLeft: 'none',
  borderRadius: 0,
  borderRight: 'none',
  borderTop: 'none',
  padding: `${uiThemeTokens.spacing.sm} clamp(${uiThemeTokens.spacing.sm}, 3vw, ${uiThemeTokens.spacing.lg})`,
  position: 'sticky',
  top: 0,
  zIndex: 200,
} as const;

const headerRowStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'space-between',
} as const;

const brandStyle = {
  alignItems: 'center',
  color: uiThemeTokens.color.text.emphasis,
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xs,
  textDecoration: 'none',
  userSelect: 'none',
} as const;

const brandLabelStyle = {
  ...uiTypeScale.sectionTitle,
  fontFamily: uiThemeTokens.typography.displayFamily,
  letterSpacing: '0.04em',
} as const;

const headerRightStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

const desktopNavStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

const controlsGroupStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
} as const;

const drawerHeaderStyle = {
  ...uiTypeScale.cardTitle,
  color: uiThemeTokens.color.text.emphasis,
  fontFamily: uiThemeTokens.typography.displayFamily,
} as const;

const drawerOverlayStyle = {
  backdropFilter: 'blur(6px)',
  background: uiThemeTokens.color.surface.overlay,
} as const;

const drawerNavStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xs,
} as const;

const drawerDividerStyle = {
  border: 'none',
  borderTop: `1px solid ${uiThemeTokens.color.border.subtle}`,
  margin: `${uiThemeTokens.spacing.md} 0`,
} as const;

const drawerControlsStyle = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
  justifyContent: 'center',
} as const;

interface AppShellHeaderProps {
  readonly isAuthenticated: boolean;
  readonly navOpened: boolean;
  readonly navHandlers: Pick<UseDisclosureHandlers, 'toggle' | 'close'>;
}

export function AppShellHeader({ isAuthenticated, navOpened, navHandlers }: AppShellHeaderProps) {
  const { t } = usePresentationTranslation();

  return (
    <>
      <header style={shellHeaderStyle}>
        <div style={headerRowStyle}>
          <BrandLink style={brandStyle} to="/">
            <PleeyLogo decorative size="sm" />
            <span style={brandLabelStyle}>{t('shared.shell.kicker')}</span>
          </BrandLink>

          <div style={headerRightStyle}>
            <nav
              aria-label={t('shared.shell.navLabel')}
              className="mantine-visible-from-sm"
              style={desktopNavStyle}
            >
              {isAuthenticated ? (
                <NavPillLink
                  leftSection={<AppIcon name="dashboard" size={16} />}
                  to="/workspace/dashboard"
                >
                  {t('shared.nav.dashboard')}
                </NavPillLink>
              ) : null}
            </nav>

            <div className="mantine-visible-from-sm" style={controlsGroupStyle}>
              <LanguageToggle />
              <ColorSchemeToggle />
            </div>

            <AccountMenu />

            <Burger
              aria-label={t('shared.shell.navToggle')}
              color={uiThemeTokens.color.text.primary}
              hiddenFrom="sm"
              onClick={navHandlers.toggle}
              opened={navOpened}
              size="sm"
            />
          </div>
        </div>
      </header>

      <Drawer
        onClose={navHandlers.close}
        opened={navOpened}
        overlayProps={{ style: drawerOverlayStyle }}
        position="right"
        size="100%"
        styles={{
          body: { background: uiThemeTokens.color.surface.canvas, flex: 1 },
          content: { display: 'flex', flexDirection: 'column' },
          header: { background: uiThemeTokens.color.surface.canvas },
        }}
        title={<span style={drawerHeaderStyle}>{t('shared.shell.kicker')}</span>}
      >
        <nav aria-label={t('shared.shell.navLabel')}>
          <div style={drawerNavStyle}>
            {isAuthenticated ? (
              <NavPillLink
                leftSection={<AppIcon name="dashboard" size={16} />}
                to="/workspace/dashboard"
              >
                {t('shared.nav.dashboard')}
              </NavPillLink>
            ) : null}
          </div>
        </nav>
        <hr style={drawerDividerStyle} />
        <div style={drawerControlsStyle}>
          <LanguageToggle />
          <ColorSchemeToggle />
        </div>
      </Drawer>
    </>
  );
}
