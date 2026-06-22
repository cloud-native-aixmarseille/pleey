import { useState } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import {
  FeedbackState,
  FeedbackStateGate,
} from '../../../../shared/ui/feedback/feedback-state-gate';
import { ContentStack, PageContainer } from '../../../../shared/ui/layout/containers';
import { InsetPanel } from '../../../../shared/ui/layout/panels';
import { ConfirmDialog } from '../../../../shared/ui/overlay/confirm-dialog';
import { useWorkspaceDependencies } from '../../../../workspace/shared/contexts/workspace-dependencies-context';
import {
  createPlayableItemEditorStateFromItem,
  type PlayableContentManagementScreenProps,
} from './playable-content-management-model';
import {
  MetadataPanel,
  PlayableManagementEditorLayout,
  PlayableManagementTab,
  PlayableManagementTabPanel,
  PlayableManagementTabs,
  ReviewPanel,
} from './playable-content-management-screen-sections';
import { PlayableManagementHeader } from './playable-management-header';
import { PlayableManagementPromptEditor } from './playable-management-prompt-editor';
import { PlayableManagementStageRail } from './stage-rail';
import { usePlayableContentManagement } from './use-playable-content-management';

export function PlayableContentManagementScreen(props: PlayableContentManagementScreenProps) {
  const { t } = usePresentationTranslation();
  const { playableItemEditorValidator } = useWorkspaceDependencies();
  const viewModel = usePlayableContentManagement(props);
  const [activeTab, setActiveTab] = useState<PlayableManagementTab>(PlayableManagementTab.STAGES);
  const openSetupTab = () => {
    setActiveTab(PlayableManagementTab.SETUP);
  };

  const openStagesTab = () => {
    setActiveTab(PlayableManagementTab.STAGES);
  };

  const openReviewTab = () => {
    setActiveTab(PlayableManagementTab.REVIEW);
  };
  const state = viewModel.state;
  const gateState = viewModel.isLoading
    ? FeedbackState.LOADING
    : state
      ? FeedbackState.READY
      : FeedbackState.EMPTY;

  const openFirstIssue = () => {
    if (!state) {
      return;
    }

    if (state.game.title.trim().length === 0) {
      openSetupTab();
      return;
    }

    if (state.items.length === 0) {
      openStagesTab();
      viewModel.selectItem(null);
      return;
    }

    const firstIncompleteItem = state.items.find(
      (item) =>
        !playableItemEditorValidator.isReady(
          createPlayableItemEditorStateFromItem(item, props.itemKindConfig),
          props.itemKindConfig,
        ),
    );

    if (firstIncompleteItem) {
      openStagesTab();
      viewModel.selectItem(firstIncompleteItem);
      return;
    }

    openReviewTab();
  };

  return (
    <PageContainer maxWidth="90rem">
      <FeedbackStateGate
        emptyLabel={viewModel.error ?? t(`${props.translationRoot}.notFound`)}
        loadingLabel={t(`${props.translationRoot}.loading`)}
        loadingVariant="editor"
        state={gateState}
      >
        {state ? (
          <ContentStack align="stretch" gap="lg">
            <PlayableManagementHeader
              onBack={viewModel.navigateBack}
              onDeleteGame={viewModel.requestDeleteGame}
              onEditGame={openSetupTab}
              saveStateLabel={
                viewModel.isSaving
                  ? t(`${props.translationRoot}.saving`)
                  : t(`${props.translationRoot}.savedJustNow`)
              }
              state={state}
              translationRoot={props.translationRoot}
            />
            <PlayableManagementTabs
              activeTab={activeTab}
              onOpenStages={openStagesTab}
              onOpenReview={openReviewTab}
              onOpenSetup={openSetupTab}
              translationRoot={props.translationRoot}
            />
            {viewModel.error ? <InsetPanel tone="accent">{viewModel.error}</InsetPanel> : null}
            {activeTab === PlayableManagementTab.SETUP ? (
              <PlayableManagementTabPanel>
                <MetadataPanel
                  allowOptionChangeAfterVoting={state.game.allowOptionChangeAfterVoting ?? false}
                  description={state.game.description}
                  isSaving={viewModel.isSaving}
                  onSave={(input) => void viewModel.saveMetadata(input)}
                  randomizeOptionOrder={state.game.randomizeOptionOrder ?? false}
                  randomizeStageOrder={state.game.randomizeStageOrder ?? false}
                  title={state.game.title}
                  translationRoot={props.translationRoot}
                />
              </PlayableManagementTabPanel>
            ) : null}
            {activeTab === PlayableManagementTab.STAGES ? (
              <PlayableManagementTabPanel>
                <PlayableManagementEditorLayout>
                  <PlayableManagementStageRail
                    itemKindConfig={props.itemKindConfig}
                    items={state.items}
                    onAddItem={() => viewModel.selectItem(null)}
                    onDeleteItem={viewModel.requestDeleteItem}
                    onMoveItem={(fromIndex, toIndex) =>
                      void viewModel.reorderItems(fromIndex, toIndex)
                    }
                    onSelectItem={viewModel.selectItem}
                    selectedItemId={viewModel.selectedItemId}
                    translationRoot={props.translationRoot}
                  />
                  <PlayableManagementPromptEditor
                    editorState={viewModel.editorState}
                    isSaving={viewModel.isSaving}
                    itemKindConfig={props.itemKindConfig}
                    onSave={() => void viewModel.saveItem()}
                    setEditorState={viewModel.setEditorState}
                    translationRoot={props.translationRoot}
                  />
                </PlayableManagementEditorLayout>
              </PlayableManagementTabPanel>
            ) : null}
            {activeTab === PlayableManagementTab.REVIEW ? (
              <PlayableManagementTabPanel>
                <ReviewPanel
                  gameTitle={state.game.title}
                  itemKindConfig={props.itemKindConfig}
                  items={state.items}
                  onEditItem={(item) => {
                    openStagesTab();
                    viewModel.selectItem(item);
                  }}
                  onGoToFirstIssue={openFirstIssue}
                  onOpenStages={openStagesTab}
                  onOpenSetup={openSetupTab}
                  translationRoot={props.translationRoot}
                />
              </PlayableManagementTabPanel>
            ) : null}
            <ConfirmDialog {...viewModel.confirmDialog} />
          </ContentStack>
        ) : null}
      </FeedbackStateGate>
    </PageContainer>
  );
}
