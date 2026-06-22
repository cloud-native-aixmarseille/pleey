import { usePresentationTranslation } from '../i18n/use-presentation-translation';
import { IconTriggerButton } from '../ui/actions/icon-trigger-button';
import { PleeyLogo } from '../ui/branding/pleey-logo';
import { AppIcon } from '../ui/icons/app-icon';
import { AccountMenu } from '../ui/navigation/account-menu/account-menu';
import { GuestPreferencesMenu } from '../ui/navigation/account-menu/guest-preferences-menu';
import { BrandLink, NavPillLink } from '../ui/navigation/links';
import { DrawerPanel } from '../ui/overlay/drawer-panel';
import {
  brandLabelStyle,
  desktopNavStyle,
  drawerControlsStyle,
  drawerDividerStyle,
  drawerNavStyle,
  headerRightStyle,
  headerRowStyle,
  menuButtonPaddingX,
  shellHeaderStyle,
} from './app-shell-header.styles';

interface AppShellNavHandlers {
  readonly close: () => void;
  readonly toggle: () => void;
}

interface AppShellHeaderProps {
  readonly isAuthenticated: boolean;
  readonly navOpened: boolean;
  readonly navHandlers: AppShellNavHandlers;
}

export function AppShellHeader({ isAuthenticated, navOpened, navHandlers }: AppShellHeaderProps) {
  const { t } = usePresentationTranslation();

  return (
    <>
      <header style={shellHeaderStyle}>
        <div style={headerRowStyle}>
          <BrandLink to="/">
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

            <AccountMenu />
            {!isAuthenticated ? <GuestPreferencesMenu /> : null}

            <IconTriggerButton
              aria-label={t('shared.shell.navToggle')}
              hiddenFrom="sm"
              minWidth="2.5rem"
              onClick={navHandlers.toggle}
              paddingX={menuButtonPaddingX}
            >
              <AppIcon name="menu" size={20} />
            </IconTriggerButton>
          </div>
        </div>
      </header>

      <DrawerPanel isOpen={navOpened} onClose={navHandlers.close} title={t('shared.shell.kicker')}>
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
        {!isAuthenticated ? (
          <>
            <hr style={drawerDividerStyle} />
            <div style={drawerControlsStyle}>
              <GuestPreferencesMenu />
            </div>
          </>
        ) : null}
      </DrawerPanel>
    </>
  );
}
