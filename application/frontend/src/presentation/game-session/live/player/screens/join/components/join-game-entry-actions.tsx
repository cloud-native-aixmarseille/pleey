import type { CSSProperties } from 'react';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../../shared/ui/actions/button';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';

const actionsStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.sm,
};

const secondaryActionsStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: uiThemeTokens.spacing.sm,
};

interface JoinGameEntryActionsProps {
  readonly isAuthenticated: boolean;
  readonly isSubmitting: boolean;
  readonly showGuestStep: boolean;
  readonly onPrimaryAction: () => void;
  readonly onBackToPin: () => void;
  readonly onNavigateToSignIn: () => void;
}

export function JoinGameEntryActions({
  isAuthenticated,
  isSubmitting,
  showGuestStep,
  onPrimaryAction,
  onBackToPin,
  onNavigateToSignIn,
}: JoinGameEntryActionsProps) {
  const { t } = usePresentationTranslation();

  return (
    <div style={actionsStyle}>
      <Button disabled={isSubmitting} onClick={onPrimaryAction} width="wide">
        {t(
          isAuthenticated
            ? 'game.join.primaryAuthenticatedCta'
            : showGuestStep
              ? 'game.join.primaryGuestCta'
              : 'game.join.primaryContinueCta',
        )}
      </Button>
      <div style={secondaryActionsStyle}>
        {!isAuthenticated && showGuestStep ? (
          <Button intent="ghost" onClick={onBackToPin} size="sm">
            {t('game.join.backToPinCta')}
          </Button>
        ) : null}
        {!isAuthenticated && !showGuestStep ? (
          <Button intent="ghost" onClick={onNavigateToSignIn} size="sm">
            {t('game.join.signInCta')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
