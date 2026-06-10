import { useState } from 'react';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { EmptyState, LoadingState } from '../../../../shared/ui/feedback/state-blocks';
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
  type PlayableManagementTab,
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
  const [activeTab, setActiveTab] = useState<PlayableManagementTab>('prompts');

  const openSetupTab = () => {
    setActiveTab('setup');
  };

  const openPromptsTab = () => {
    setActiveTab('prompts');
  };

  const openReviewTab = () => {
    setActiveTab('review');
  };

  if (viewModel.isLoading) {
    return (
      <PageContainer maxWidth="90rem">
        <LoadingState variant="editor">{t(`${props.translationRoot}.loading`)}</LoadingState>
      </PageContainer>
    );
  }

  if (!viewModel.state) {
    return (
      <PageContainer maxWidth="90rem">
        <EmptyState>{viewModel.error ?? t(`${props.translationRoot}.notFound`)}</EmptyState>
      </PageContainer>
    );
  }

  const state = viewModel.state;

  const openFirstIssue = () => {
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
        <div aria-label={t(`${props.translationRoot}.tabsLabel`)} role="tablist" style={tabsStyle}>
          <button
            aria-selected={activeTab === 'setup'}
            onClick={openSetupTab}
            role="tab"
            style={createTabStyle(activeTab === 'setup')}
            type="button"
          >
            {t(`${props.translationRoot}.tabSetup`)}
          </button>
          <button
            aria-selected={activeTab === 'prompts'}
            onClick={openPromptsTab}
            role="tab"
            style={createTabStyle(activeTab === 'prompts')}
            type="button"
          >
            {t(`${props.translationRoot}.tabPrompts`)}
          </button>
          <button
            aria-selected={activeTab === 'review'}
            onClick={openReviewTab}
            role="tab"
            style={createTabStyle(activeTab === 'review')}
            type="button"
          >
            {t(`${props.translationRoot}.tabReview`)}
          </button>
        </div>
        {viewModel.error ? <InsetPanel tone="accent">{viewModel.error}</InsetPanel> : null}
        {activeTab === 'setup' ? (
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
        {activeTab === 'prompts' ? (
          <div style={tabPanelShellStyle}>
            <div style={editorLayoutStyle}>
              <PlayableManagementStageRail
                itemKindConfig={props.itemKindConfig}
                items={state.items}
                onAddItem={() => viewModel.selectItem(null)}
                onDeleteItem={viewModel.requestDeleteItem}
                onMoveItem={(fromIndex, toIndex) => void viewModel.reorderItems(fromIndex, toIndex)}
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
                    allowOptionChangeAfterVoting: state.game.allowOptionChangeAfterVoting ?? false,
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
        {activeTab === 'review' ? (
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
    </PageContainer>
  );
}
