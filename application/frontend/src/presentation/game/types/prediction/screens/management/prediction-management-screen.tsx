import { useState } from 'react';
import type {
  PlayableContentImportExampleProvider,
  PlayableContentImportGateway,
} from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import type { PlayableContentManagementGateway } from '../../../../../../application/game/types/shared/contracts/playable-management.gateway';
import type { PredictionPromptId } from '../../../../../../domains/game/types/prediction/entities/prediction-prompt-id';
import { PresentationRedirect, usePresentationParams } from '../../../../../shared/routing/router';
import { PlayableContentImportPanel } from '../../../shared/management/playable-content-import-panel';
import type { ManagementGameTypeIdParser } from '../../../shared/management/playable-content-management-model';
import { PlayableContentManagementScreen } from '../../../shared/management/playable-content-management-screen';

interface PredictionManagementScreenProps {
  readonly exampleFactory: PlayableContentImportExampleProvider;
  readonly gateway: PlayableContentManagementGateway<PredictionPromptId>;
  readonly gameTypeIdentifier: ManagementGameTypeIdParser;
  readonly importGateway: PlayableContentImportGateway;
}

export function PredictionManagementScreen({
  exampleFactory,
  gameTypeIdentifier,
  gateway,
  importGateway,
}: PredictionManagementScreenProps) {
  const params = usePresentationParams<'predictionId'>();
  const predictionId = gameTypeIdentifier.parseOrNull(params.predictionId);
  const [refreshKey, setRefreshKey] = useState(0);

  if (predictionId === null) {
    return <PresentationRedirect replace to="/workspace/dashboard" />;
  }

  return (
    <PlayableContentManagementScreen
      headerSupplement={
        <PlayableContentImportPanel
          exampleProvider={exampleFactory}
          gameTypeId={predictionId}
          importGateway={importGateway}
          onImported={() => setRefreshKey((currentValue) => currentValue + 1)}
          translationRoot="game.types.prediction.management"
        />
      }
      gameTypeId={predictionId}
      gateway={gateway}
      key={refreshKey}
      translationRoot="game.types.prediction.management"
    />
  );
}
