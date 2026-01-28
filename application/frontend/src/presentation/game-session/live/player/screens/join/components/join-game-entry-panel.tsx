import type { CSSProperties } from 'react';
import type { GameJoinErrorCode } from '../../../../../../../domains/game-session/errors/game-join-error-code';
import { usePresentationTranslation } from '../../../../../../shared/i18n/use-presentation-translation';
import { StatusBanner } from '../../../../../../shared/ui/feedback/status-banner';
import { FieldShell } from '../../../../../../shared/ui/forms/field-shell';
import { Input } from '../../../../../../shared/ui/forms/input';
import { motionRecipes, surfaceRecipes } from '../../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../../shared/ui/icons/app-icon';
import { JoinGameEntryActions } from './join-game-entry-actions';
import { JoinGameEntryIdentity } from './join-game-entry-identity';
import { JoinGamePinInput } from './join-game-pin-input';

interface JoinGameFlowLike {
  readonly expectedPinLength: number;
}

interface JoinGameEntryPanelProps {
  readonly flowService: JoinGameFlowLike;
  readonly isAuthenticated: boolean;
  readonly isSubmitting: boolean;
  readonly normalizedPin: string;
  readonly nickname: string;
  readonly pinErrorCode: GameJoinErrorCode | null;
  readonly nicknameErrorCode: GameJoinErrorCode | null;
  readonly errorCode: GameJoinErrorCode | null;
  readonly requestMessage: string | null;
  readonly showGuestStep: boolean;
  readonly userName: string | null;
  readonly onPinBlur: () => void;
  readonly onPinChange: (value: string) => void;
  readonly onNicknameBlur: () => void;
  readonly onNicknameChange: (value: string) => void;
  readonly onPrimaryAction: () => void;
  readonly onBackToPin: () => void;
  readonly onNavigateToSignIn: () => void;
}

const panelStyle: CSSProperties = {
  ...surfaceRecipes.elevated,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.lg,
  maxWidth: '32rem',
  marginInline: 'auto',
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.lg}`,
  width: '100%',
};

const pinCompleteBadgeStyle: CSSProperties = {
  ...uiTypeScale.caption,
  alignItems: 'center',
  background: uiThemeTokens.color.surface.accentMuted,
  border: `1px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.brand.accent,
  display: 'inline-flex',
  gap: uiThemeTokens.spacing.xxs,
  marginTop: uiThemeTokens.spacing.xxs,
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm}`,
  ...motionRecipes.standard('opacity'),
};

const separatorStyle: CSSProperties = {
  background: uiThemeTokens.color.border.subtle,
  border: 'none',
  height: 1,
  margin: 0,
  width: '100%',
};

export function JoinGameEntryPanel({
  flowService,
  isAuthenticated,
  isSubmitting,
  normalizedPin,
  nickname,
  pinErrorCode,
  nicknameErrorCode,
  errorCode,
  requestMessage,
  showGuestStep,
  userName,
  onPinBlur,
  onPinChange,
  onNicknameBlur,
  onNicknameChange,
  onPrimaryAction,
  onBackToPin,
  onNavigateToSignIn,
}: JoinGameEntryPanelProps) {
  const { t } = usePresentationTranslation();

  const pinComplete = normalizedPin.length === flowService.expectedPinLength;

  return (
    <div style={panelStyle}>
      <JoinGameEntryIdentity
        isAuthenticated={isAuthenticated}
        showGuestStep={showGuestStep}
        userName={userName}
      />

      <hr style={separatorStyle} />

      <FieldShell
        description={t('game.join.pinDescription')}
        error={pinErrorCode ? t(`game.join.errors.${pinErrorCode}`) : null}
        id="join-game-pin"
        label={t('game.join.pinLabel')}
        required
      >
        <JoinGamePinInput
          id="join-game-pin"
          maxLength={flowService.expectedPinLength}
          onBlur={onPinBlur}
          onChange={(event) => onPinChange(event.target.value)}
          placeholder={t('game.join.pinPlaceholder')}
          value={normalizedPin}
        />
      </FieldShell>

      {pinComplete && !showGuestStep ? (
        <div style={pinCompleteBadgeStyle}>
          <AppIcon name="success" size={14} />
          {t('game.join.pinLabel')} ✓
        </div>
      ) : null}

      {!isAuthenticated && showGuestStep ? (
        <>
          <hr style={separatorStyle} />
          <FieldShell
            description={t('game.join.nicknameDescription')}
            error={nicknameErrorCode ? t(`game.join.errors.${nicknameErrorCode}`) : null}
            id="join-game-nickname"
            label={t('game.join.nicknameLabel')}
            required
          >
            <Input
              id="join-game-nickname"
              onBlur={onNicknameBlur}
              onChange={(event) => onNicknameChange(event.target.value)}
              placeholder={t('game.join.nicknamePlaceholder')}
              value={nickname}
            />
          </FieldShell>
        </>
      ) : null}

      <StatusBanner tone="error">
        {errorCode ? t(`game.join.errors.${errorCode}`) : null}
      </StatusBanner>
      <StatusBanner tone="success">{requestMessage}</StatusBanner>

      <JoinGameEntryActions
        isAuthenticated={isAuthenticated}
        isSubmitting={isSubmitting}
        onBackToPin={onBackToPin}
        onNavigateToSignIn={onNavigateToSignIn}
        onPrimaryAction={onPrimaryAction}
        showGuestStep={showGuestStep}
      />
    </div>
  );
}
