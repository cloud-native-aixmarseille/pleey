import type { PlayableContentManagementGateway } from '../../../../../../application/game/types/shared/contracts/playable-management.gateway';
import type { QuizQuestionId } from '../../../../../../domains/game/types/quiz/entities/quiz-question-id';
import type { QuizQuestionKind } from '../../../../../../domains/game/types/quiz/entities/quiz-question-kind';
import { PresentationRedirect, usePresentationParams } from '../../../../../shared/routing/router';
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
  readonly gateway: PlayableContentManagementGateway<QuizQuestionId>;
  readonly gameTypeIdentifier: ManagementGameTypeIdParser;
}

export function QuizManagementScreen({ gameTypeIdentifier, gateway }: QuizManagementScreenProps) {
  const params = usePresentationParams<'quizId'>();
  const quizId = gameTypeIdentifier.parseOrNull(params.quizId);

  if (quizId === null) {
    return <PresentationRedirect replace to="/workspace/dashboard" />;
  }

  return (
    <PlayableContentManagementScreen
      gameTypeId={quizId}
      gateway={gateway}
      itemKindConfig={quizItemKindConfig}
      translationRoot="game.types.quiz.management"
    />
  );
}
