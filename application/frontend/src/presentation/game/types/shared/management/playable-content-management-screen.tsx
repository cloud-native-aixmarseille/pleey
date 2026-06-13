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
  createTabStyle,
  editorLayoutStyle,
  MetadataPanel,
  PlayableManagementTab,
  ReviewPanel,
  tabPanelShellStyle,
  tabsStyle,
} from './playable-content-management-screen-sections';
import { PlayableManagementHeader } from './playable-management-header';
import { PlayableManagementPromptEditor } from './playable-management-prompt-editor';
import { PlayableManagementStageRail } from './playable-management-stage-rail';
import { usePlayableContentManagement } from './use-playable-content-management';

export function PlayableContentManagementScreen(props: PlayableContentManagementScreenProps) {
  const { t } = usePresentationTranslation();
  const { playableItemEditorValidator } = useWorkspaceDependencies();
  const viewModel = usePlayableContentManagement(props);
  const [activeTab, setActiveTab] = useState<PlayableManagementTab>(PlayableManagementTab.PROMPTS);
  const openSetupTab = () => {
    setActiveTab(PlayableManagementTab.SETUP);
  };

  const openPromptsTab = () => {
    setActiveTab(PlayableManagementTab.PROMPTS);
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
      openPromptsTab();
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
      openPromptsTab();
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
            <div
              aria-label={t(`${props.translationRoot}.tabsLabel`)}
              role="tablist"
              style={tabsStyle}
            >
              <button
                aria-selected={activeTab === PlayableManagementTab.SETUP}
                onClick={openSetupTab}
                role="tab"
                style={createTabStyle(activeTab === PlayableManagementTab.SETUP)}
                type="button"
              >
                {t(`${props.translationRoot}.tabSetup`)}
              </button>
              <button
                aria-selected={activeTab === PlayableManagementTab.PROMPTS}
                onClick={openPromptsTab}
                role="tab"
                style={createTabStyle(activeTab === PlayableManagementTab.PROMPTS)}
                type="button"
              >
                {t(`${props.translationRoot}.tabPrompts`)}
              </button>
              <button
                aria-selected={activeTab === PlayableManagementTab.REVIEW}
                onClick={openReviewTab}
                role="tab"
                style={createTabStyle(activeTab === PlayableManagementTab.REVIEW)}
                type="button"
              >
                {t(`${props.translationRoot}.tabReview`)}
              </button>
            </div>
            {viewModel.error ? <InsetPanel tone="accent">{viewModel.error}</InsetPanel> : null}
            {activeTab === PlayableManagementTab.SETUP ? (
              <div style={tabPanelShellStyle}>
                <MetadataPanel
                  allowOptionChangeAfterVoting={state.game.allowOptionChangeAfterVoting ?? false}
                  description={state.game.description}
                  isSaving={viewModel.isSaving}
                  onSave={(input) =>
                    void viewModel.saveMetadata({
                      ...input,
                      randomizeOptionOrder: state.game.randomizeOptionOrder ?? false,
                    })
                  }
                  randomizeStageOrder={state.game.randomizeStageOrder ?? false}
                  title={state.game.title}
                  translationRoot={props.translationRoot}
                />
              </div>
            ) : null}
            {activeTab === PlayableManagementTab.PROMPTS ? (
              <div style={tabPanelShellStyle}>
                <div style={editorLayoutStyle}>
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
                    onSaveRandomizeOptionOrder={(value) =>
                      void viewModel.saveMetadata({
                        title: state.game.title,
                        description: state.game.description ?? '',
                        allowOptionChangeAfterVoting:
                          state.game.allowOptionChangeAfterVoting ?? false,
                        randomizeStageOrder: state.game.randomizeStageOrder ?? false,
                        randomizeOptionOrder: value,
                      })
                    }
                    onSave={() => void viewModel.saveItem()}
                    randomizeOptionOrder={state.game.randomizeOptionOrder ?? false}
                    setEditorState={viewModel.setEditorState}
                    translationRoot={props.translationRoot}
                  />
                </div>
              </div>
            ) : null}
            {activeTab === PlayableManagementTab.REVIEW ? (
              <div style={tabPanelShellStyle}>
                <ReviewPanel
                  gameTitle={state.game.title}
                  itemKindConfig={props.itemKindConfig}
                  items={state.items}
                  onEditItem={(item) => {
                    openPromptsTab();
                    viewModel.selectItem(item);
                  }}
                  onGoToFirstIssue={openFirstIssue}
                  onOpenPrompts={openPromptsTab}
                  onOpenSetup={openSetupTab}
                  translationRoot={props.translationRoot}
                />
              </div>
            ) : null}
            <ConfirmDialog {...viewModel.confirmDialog} />
          </ContentStack>
        ) : null}
      </FeedbackStateGate>
    </PageContainer>
  );
}
