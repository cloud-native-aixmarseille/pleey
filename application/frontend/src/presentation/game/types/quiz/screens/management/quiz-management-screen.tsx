import { useState } from 'react';
import type {
  PlayableContentImportExampleProvider,
  PlayableContentImportGateway,
} from '../../../../../../application/game/types/shared/contracts/playable-content-import.gateway';
import type { PlayableContentManagementGateway } from '../../../../../../application/game/types/shared/contracts/playable-management.gateway';
import type { QuizQuestionId } from '../../../../../../domains/game/types/quiz/entities/quiz-question-id';
import type { QuizQuestionKind } from '../../../../../../domains/game/types/quiz/entities/quiz-question-kind';
import { PresentationRedirect, usePresentationParams } from '../../../../../shared/routing/router';
import { PlayableContentImportPanel } from '../../../shared/management/playable-content-import-panel';
import type {
  ManagementGameTypeIdParser,
  PlayableItemKindConfig,
} from '../../../shared/management/playable-content-management-model';
import { PlayableContentManagementScreen } from '../../../shared/management/playable-content-management-screen';

const quizItemKindConfig: PlayableItemKindConfig<QuizQuestionKind> = {
  defaultKind: 'multiple',
  options: [
    {
      correctSelectionMode: 'multiple',
      labelKey: 'game.types.quiz.management.kindMultiple',
      value: 'multiple',
    },
    {
      correctSelectionMode: 'single',
      fixedOptions: [
        { labelKey: 'game.types.quiz.management.true', text: null },
        { labelKey: 'game.types.quiz.management.false', text: null },
      ],
      labelKey: 'game.types.quiz.management.kindTrueFalse',
      value: 'truefalse',
    },
  ],
};

interface QuizManagementScreenProps {
  readonly exampleFactory: PlayableContentImportExampleProvider;
  readonly gateway: PlayableContentManagementGateway<QuizQuestionId>;
  readonly gameTypeIdentifier: ManagementGameTypeIdParser;
  readonly importGateway: PlayableContentImportGateway;
}

export function QuizManagementScreen({
  exampleFactory,
  gameTypeIdentifier,
  gateway,
  importGateway,
}: QuizManagementScreenProps) {
  const params = usePresentationParams<'quizId'>();
  const quizId = gameTypeIdentifier.parseOrNull(params.quizId);
  const [refreshKey, setRefreshKey] = useState(0);

  if (quizId === null) {
    return <PresentationRedirect replace to="/workspace/dashboard" />;
  }

  return (
    <PlayableContentManagementScreen
      headerSupplement={
        <PlayableContentImportPanel
          exampleProvider={exampleFactory}
          gameTypeId={quizId}
          importGateway={importGateway}
          onImported={() => setRefreshKey((currentValue) => currentValue + 1)}
          translationRoot="game.types.quiz.management"
        />
      }
      gameTypeId={quizId}
      gateway={gateway}
      itemKindConfig={quizItemKindConfig}
      key={refreshKey}
      translationRoot="game.types.quiz.management"
    />
  );
}
