import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../../domains/game/types/shared/game-type';
import type { PartyGameTypeRuntimeView } from '../../../../../presentation/game/party/shared/contexts/party-game-type-runtime-registry-context';
import { PredictionHostResultPanel } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-host-result-panel';
import { PredictionHostStagePanel } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-host-stage-panel';
import { PredictionPlayerResultSurface } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-player-result-surface';
import { PredictionPlayerStageSurface } from '../../../../../presentation/game/types/prediction/screens/live/components/prediction-player-stage-surface';
import { PredictionPartyGameTypeRuntimeView } from './prediction-party-game-type-runtime-view';

type HostRuntimePanelProps = Parameters<PartyGameTypeRuntimeView['renderHostStagePanel']>[0];
type PlayerResultSurfaceProps = Parameters<
  PartyGameTypeRuntimeView['renderPlayerResultSurface']
>[0];
type PlayerStageSurfaceProps = Parameters<PartyGameTypeRuntimeView['renderPlayerStageSurface']>[0];

function expectElementType(renderedNode: ReactNode, expectedType: unknown) {
  expect(isValidElement(renderedNode)).toBe(true);

  if (!isValidElement(renderedNode)) {
    throw new Error('Expected a React element');
  }

  expect(renderedNode.type).toBe(expectedType);
}

describe('PredictionPartyGameTypeRuntimeView', () => {
  it('contributes runtime panels for prediction parties', () => {
    const party = {} as HostRuntimePanelProps['party'];
    const runtimeView = new PredictionPartyGameTypeRuntimeView();

    expect(runtimeView.gameType).toBe(GameType.Prediction);
    expectElementType(runtimeView.renderHostStagePanel({ party }), PredictionHostStagePanel);
    expectElementType(runtimeView.renderHostResultPanel({ party }), PredictionHostResultPanel);
  });

  it('contributes player runtime surfaces for prediction parties', () => {
    const party = {} as PlayerStageSurfaceProps['party'];
    const playerStageProps = {
      onLeaveParty: vi.fn(),
      onSubmitAction: vi.fn(),
      party,
      pendingActionId: null,
      playerActionErrorMessage: null,
    } satisfies PlayerStageSurfaceProps;
    const playerResultProps = {
      onLeaveParty: vi.fn(),
      party,
    } satisfies PlayerResultSurfaceProps;
    const runtimeView = new PredictionPartyGameTypeRuntimeView();

    expectElementType(
      runtimeView.renderPlayerStageSurface(playerStageProps),
      PredictionPlayerStageSurface,
    );
    expectElementType(
      runtimeView.renderPlayerResultSurface(playerResultProps),
      PredictionPlayerResultSurface,
    );
  });
});
