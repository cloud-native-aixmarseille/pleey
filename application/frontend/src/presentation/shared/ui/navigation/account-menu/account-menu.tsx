import { AccountMenuAuthenticated } from './account-menu-authenticated';
import { AccountMenuGuestButton } from './account-menu-guest-button';
import { useAccountMenuState } from './use-account-menu-state';

export function AccountMenu() {
  const {
    handleNavigateToProfile,
    handleSignIn,
    handleSignOut,
    isAuthenticated,
    opened,
    toggle,
    user,
    wrapperRef,
  } = useAccountMenuState();

  if (!isAuthenticated || !user) {
    return <AccountMenuGuestButton onSignIn={handleSignIn} />;
  }

  return (
    <AccountMenuAuthenticated
      onNavigateToProfile={handleNavigateToProfile}
      onSignOut={handleSignOut}
      onToggle={toggle}
      opened={opened}
      user={user}
      wrapperRef={wrapperRef}
    />
  );
}
