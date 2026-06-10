import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { GuestUsernameGeneratorPort } from '../../../../../domains/game/party/player/ports/guest-username-generator.port';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import { PartyIdentifierMockFactory } from '../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyPinIdentifierMockFactory } from '../../../../../test-utils/mocks/party-pin-identifier-mock-factory';
import { StageIdentifierMockFactory } from '../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { PlayerRuntimeNoticeMessageResolver } from '../../player/screens/components/player-runtime-notice-message-resolver';
import { GuestPartyEntryDraftFactory } from '../../player/screens/guest-party-entry-draft-factory';
import { PartyLobbyRuntimeRedirectResolver } from '../screens/party-lobby-runtime-redirect-resolver';
import {
  type PartyDependencies,
  providePartyDependencies,
  usePartyDependencies,
} from './party-dependencies-context';

const partyIdentifier: PartyDependencies['partyIdentifier'] =
  new PartyIdentifierMockFactory().create();
const partyPinIdentifier: PartyDependencies['partyPinIdentifier'] =
  new PartyPinIdentifierMockFactory().create();
const stageIdentifier: PartyDependencies['stageIdentifier'] =
  new StageIdentifierMockFactory().create();

const guestUsernameGenerator: GuestUsernameGeneratorPort = {
  generateGuestUsername: () => 'Bright Otter 0001',
};

describe('partyDependenciesContext', () => {
  describe('usePartyDependencies()', () => {
    it('returns the dependencies from context', () => {
      // Arrange
      const dependencies: PartyDependencies = {
        guestPartyEntryDraftFactory: new GuestPartyEntryDraftFactory(guestUsernameGenerator),
        hostPartyRuntimeControlsResolver: {
          resolveControls: vi.fn(),
        } as never,
        partyIdentifier,
        partyLobbyFacade: {
          clearGuestId: vi.fn(),
          executeHostRuntimeCommand: vi.fn(),
          getGuestId: vi.fn(() => null),
          joinParty: vi.fn(),
          kickPlayer: vi.fn(),
          leaveParty: vi.fn(),
          listParties: vi.fn(),
          rejoinParty: vi.fn(),
          setGuestId: vi.fn(),
          submitAction: vi.fn(),
        },
        partyLobbyRuntimeRedirectResolver: new PartyLobbyRuntimeRedirectResolver(),
        partyGuestSessionPort: {
          clearGuestId: vi.fn(),
          getGuestId: vi.fn(() => null),
          setGuestId: vi.fn(),
        },
        partyHostControlPort: {
          advanceStage: vi.fn(),
          endParty: vi.fn(),
          pauseParty: vi.fn(),
          restartStage: vi.fn(),
          resumeParty: vi.fn(),
          revealStageResult: vi.fn(),
          rewindParty: vi.fn(),
          rewindStage: vi.fn(),
          startParty: vi.fn(),
        } as never,
        partyManagementPort: {
          createParty: vi.fn(),
          listParties: vi.fn(),
        } as never,
        partyPlayerPort: {
          joinParty: vi.fn(),
          leaveParty: vi.fn(),
          rejoinParty: vi.fn(),
          submitAction: vi.fn(),
        },
        partyObservationPort: {
          observeParty: vi.fn(),
        },
        partyPinIdentifier,
        playerRuntimeNoticeMessageResolver: new PlayerRuntimeNoticeMessageResolver(),
        privatePartyPasswordGeneratorPort: { generatePrivatePartyPassword: vi.fn(() => 'TestPassword1234') },
        stageIdentifier,
      };
      const wrapper = ({ children }: { children: ReactNode }) =>
        providePartyDependencies(children, dependencies);

      // Act
      const { result } = renderHook(() => usePartyDependencies(), { wrapper });

      // Assert
      expect(result.current).toBe(dependencies);
    });

    it('throws when called without the provider', () => {
      // Arrange + Act
      const renderWithoutProvider = () => renderHook(() => usePartyDependencies());

      // Assert
      expect(renderWithoutProvider).toThrow(
        PresentationContextErrorCode.PRESENTATION_RUNTIME_DEPENDENCY_PROVIDER_REQUIRED,
      );
    });
  });
});
