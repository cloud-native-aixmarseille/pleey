import { AccountMenuAuthenticated } from './account-menu-authenticated';
import { AccountMenuGuestButton } from './account-menu-guest-button';
import { useAccountMenuState } from './use-account-menu-state';

interface AccountMenuProps {
  readonly appVersion?: string;
}

export function AccountMenu({ appVersion = '' }: AccountMenuProps) {
  const { handleNavigateToProfile, handleSignIn, handleSignOut, opened, toggle, user, wrapperRef } =
    useAccountMenuState();

  if (user === null) {
    return <AccountMenuGuestButton onSignIn={handleSignIn} />;
  }

  return (
    <AccountMenuAuthenticated
      appVersion={appVersion}
      onNavigateToProfile={handleNavigateToProfile}
      onSignOut={handleSignOut}
      onToggle={toggle}
      opened={opened}
      user={user}
      wrapperRef={wrapperRef}
    />
  );
}
