import type { PlayableContentManagementGateway } from '../../../../../../application/game/types/shared/contracts/playable-management.gateway';
import type { PredictionPromptId } from '../../../../../../domains/game/types/prediction/entities/prediction-prompt-id';
import { PresentationRedirect, usePresentationParams } from '../../../../../shared/routing/router';
import type { ManagementGameTypeIdParser } from '../../../shared/management/playable-content-management-model';
import { PlayableContentManagementScreen } from '../../../shared/management/playable-content-management-screen';

interface PredictionManagementScreenProps {
  readonly gateway: PlayableContentManagementGateway<PredictionPromptId>;
  readonly gameTypeIdentifier: ManagementGameTypeIdParser;
}

export function PredictionManagementScreen({
  gameTypeIdentifier,
  gateway,
}: PredictionManagementScreenProps) {
  const params = usePresentationParams<'predictionId'>();
  const predictionId = gameTypeIdentifier.parseOrNull(params.predictionId);

  if (predictionId === null) {
    return <PresentationRedirect to="/workspace/dashboard" />;
  }

  return (
    <PlayableContentManagementScreen
      gameTypeId={predictionId}
      gateway={gateway}
      translationRoot="game.types.prediction.management"
    />
  );
}
