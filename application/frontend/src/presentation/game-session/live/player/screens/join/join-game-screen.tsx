import type { CSSProperties } from 'react';
import { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { JoinGameScreenFacade } from '../../../../../../application/game-session/live/player/facades/join-game-screen.facade';
import type { DashboardActiveSessionItem } from '../../../../../../domains/game-session/entities/active-game-session';
import { useAuth } from '../../../../../identity/contexts/auth-context';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { useGameSessionRoutes } from '../../../../../shared/routing/game-session-route-context';
import { usePresentationNavigate } from '../../../../../shared/routing/router';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { uiTypeScale } from '../../../../../shared/ui/foundation/ui-typography';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { useGameJoin } from '../../../shared/contexts/game-join-context';
import { JoinGameEntryPanel } from './components/join-game-entry-panel';
import { JoinGameGuidanceBar } from './components/join-game-guidance-bar';
import { useJoinGameScreenState } from './use-join-game-screen-state';

const screenRootStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.lg,
  minHeight: '100%',
  paddingBottom: uiThemeTokens.spacing.xxl,
};

const heroStyle: CSSProperties = {
  ...surfaceRecipes.hero,
  alignItems: 'center',
  borderRadius: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.md,
  padding: `${uiThemeTokens.spacing.xxl} ${uiThemeTokens.spacing.lg} ${uiThemeTokens.spacing.xl}`,
  textAlign: 'center',
};

const heroIconStyle: CSSProperties = {
  alignItems: 'center',
  background: uiThemeTokens.color.surface.accentMuted,
  border: `2px solid ${uiThemeTokens.color.border.accent}`,
  borderRadius: '50%',
  boxShadow: uiThemeTokens.shadow.accentGlow,
  display: 'flex',
  height: 56,
  justifyContent: 'center',
  width: 56,
};

const heroTitleStyle: CSSProperties = {
  ...uiTypeScale.hero,
  color: uiThemeTokens.color.text.emphasis,
  margin: 0,
  maxWidth: '36rem',
};

const heroSubtitleStyle: CSSProperties = {
  ...uiTypeScale.body,
  color: uiThemeTokens.color.text.soft,
  margin: 0,
  maxWidth: '32rem',
};

const contentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.lg,
  marginInline: 'auto',
  maxWidth: '36rem',
  padding: `0 ${uiThemeTokens.spacing.md}`,
  width: '100%',
};

interface JoinGameScreenProps {
  readonly joinGameScreenFacade: JoinGameScreenFacade;
  readonly loadCurrentPlayerSession: () => Promise<DashboardActiveSessionItem | null>;
  readonly resolveSessionEntryRoute: (session: DashboardActiveSessionItem) => string;
}

export function JoinGameScreen({
  joinGameScreenFacade,
  loadCurrentPlayerSession,
  resolveSessionEntryRoute,
}: JoinGameScreenProps) {
  const {
    joinGameFlow: flowService,
    clearError,
    errorCode,
    guestNickname,
    isSubmitting,
    joinAsAuthenticated,
    joinAsGuest,
    lastJoinRequest,
  } = useGameJoin();
  const { t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();
  const { resolveLobbyRoute } = useGameSessionRoutes();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let ignore = false;

    void (async () => {
      try {
        const session = await loadCurrentPlayerSession();

        if (!ignore && session) {
          navigate(resolveSessionEntryRoute(session));
        }
      } catch {
        // Let the join route render normally when the current player session cannot be loaded.
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, loadCurrentPlayerSession, navigate, resolveSessionEntryRoute]);

  const prefilledPin = useMemo(
    () => flowService.truncatePin(searchParams.get('pin') ?? ''),
    [flowService, searchParams],
  );
  const signInRoute = useMemo(() => {
    const currentRoute = `${location.pathname}${location.search}`;

    return `/identity/sign-in?redirectTo=${encodeURIComponent(currentRoute)}`;
  }, [location.pathname, location.search]);
  const {
    currentStep,
    nickname,
    nicknameErrorCode,
    normalizedPin,
    pinErrorCode,
    requestMessage,
    setNicknameTouched,
    setPinTouched,
    showGuestStep,
    handleBackToPin,
    handleNicknameChange,
    handlePinChange,
    handlePrimaryAction,
  } = useJoinGameScreenState({
    clearError,
    flowService,
    guestNickname,
    isAuthenticated,
    joinGameScreenFacade,
    joinAsAuthenticated,
    joinAsGuest,
    lastJoinRequest,
    navigate,
    prefilledPin,
    resolveLobbyRoute,
    translate: t,
    user,
  });

  return (
    <div style={screenRootStyle}>
      <div style={heroStyle}>
        <div style={heroIconStyle}>
          <AppIcon name="game" size={28} />
        </div>
        <h1 style={heroTitleStyle}>{t('game.join.title')}</h1>
        <p style={heroSubtitleStyle}>{t('game.join.subtitle')}</p>
      </div>

      <div style={contentStyle}>
        <JoinGameGuidanceBar currentStep={currentStep} />

        <JoinGameEntryPanel
          errorCode={errorCode}
          flowService={flowService}
          isAuthenticated={isAuthenticated}
          isSubmitting={isSubmitting}
          nickname={nickname}
          nicknameErrorCode={nicknameErrorCode}
          normalizedPin={normalizedPin}
          onBackToPin={handleBackToPin}
          onNavigateToSignIn={() => navigate(signInRoute)}
          onNicknameBlur={() => setNicknameTouched(true)}
          onNicknameChange={handleNicknameChange}
          onPinBlur={() => setPinTouched(true)}
          onPinChange={handlePinChange}
          onPrimaryAction={handlePrimaryAction}
          pinErrorCode={pinErrorCode}
          requestMessage={requestMessage}
          showGuestStep={showGuestStep}
          userName={user?.username ?? null}
        />
      </div>
    </div>
  );
}
