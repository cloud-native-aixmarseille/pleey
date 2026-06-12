import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../../../../domains/game/types/shared/management/playable-management';
import { usePresentationTranslation } from '../../../../shared/i18n/use-presentation-translation';
import { usePresentationNavigate } from '../../../../shared/routing/router';
import { useConfirmDialog } from '../../../../shared/ui/overlay/use-confirm-dialog';
import {
  createEmptyPlayableItemEditorState,
  createPlayableItemEditorStateFromItem,
  createPlayableItemInput,
  type PlayableContentManagementScreenProps,
  type PlayableItemEditorState,
} from './playable-content-management-model';

type ConfirmRequest =
  | { readonly kind: 'deleteGame'; readonly title: string }
  | { readonly kind: 'deleteItem'; readonly item: PlayableManagementItem };

export function usePlayableContentManagement({
  gameTypeId,
  gateway,
  itemKindConfig,
  translationRoot,
}: PlayableContentManagementScreenProps) {
  const { t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();
  const confirmDialog = useConfirmDialog();
  const [state, setState] = useState<PlayableManagementState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<PlayableItemEditorState>(() =>
    createEmptyPlayableItemEditorState(itemKindConfig),
  );
  const [savedPulseAt, setSavedPulseAt] = useState<number>(0);
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmRequest | null>(null);
  const lastDescriptionRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextState = await gateway.load(gameTypeId);
      setState(nextState);
      lastDescriptionRef.current = nextState.game.description;
      const firstItem = nextState.items[0];
      if (firstItem) {
        setSelectedItemId(firstItem.id);
        setEditorState(createPlayableItemEditorStateFromItem(firstItem, itemKindConfig));
      } else {
        setSelectedItemId(null);
        setEditorState(createEmptyPlayableItemEditorState(itemKindConfig));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t(`${translationRoot}.loadError`));
    } finally {
      setIsLoading(false);
    }
  }, [gameTypeId, gateway, t, translationRoot, itemKindConfig]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectItem = (item: PlayableManagementItem | null) => {
    if (item === null) {
      setSelectedItemId(null);
      setEditorState(createEmptyPlayableItemEditorState(itemKindConfig));
      return;
    }
    setSelectedItemId(item.id);
    setEditorState(createPlayableItemEditorStateFromItem(item, itemKindConfig));
  };

  const pulseSaved = () => setSavedPulseAt(Date.now());

  const saveMetadata = async ({
    title,
    description,
    allowOptionChangeAfterVoting,
    randomizeStageOrder,
    randomizeOptionOrder,
  }: {
    readonly title: string;
    readonly description: string;
    readonly allowOptionChangeAfterVoting?: boolean;
    readonly randomizeStageOrder?: boolean;
    readonly randomizeOptionOrder?: boolean;
  }) => {
    if (!state) {
      return;
    }

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim() || null;

    if (normalizedTitle.length === 0) {
      return;
    }

    if (
      normalizedTitle === state.game.title &&
      normalizedDescription === lastDescriptionRef.current &&
      (allowOptionChangeAfterVoting ?? state.game.allowOptionChangeAfterVoting ?? false) ===
        (state.game.allowOptionChangeAfterVoting ?? false) &&
      (randomizeStageOrder ?? state.game.randomizeStageOrder ?? false) ===
        (state.game.randomizeStageOrder ?? false) &&
      (randomizeOptionOrder ?? state.game.randomizeOptionOrder ?? false) ===
        (state.game.randomizeOptionOrder ?? false)
    ) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await gateway.updateMetadata(gameTypeId, {
        title: normalizedTitle,
        description: normalizedDescription,
        allowOptionChangeAfterVoting,
        randomizeStageOrder,
        randomizeOptionOrder,
      });
      lastDescriptionRef.current = normalizedDescription;
      setState({
        ...state,
        game: {
          ...state.game,
          title: normalizedTitle,
          description: normalizedDescription,
          allowOptionChangeAfterVoting:
            allowOptionChangeAfterVoting ?? state.game.allowOptionChangeAfterVoting ?? false,
          randomizeStageOrder: randomizeStageOrder ?? state.game.randomizeStageOrder ?? false,
          randomizeOptionOrder: randomizeOptionOrder ?? state.game.randomizeOptionOrder ?? false,
        },
      });
      pulseSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t(`${translationRoot}.saveError`));
    } finally {
      setIsSaving(false);
    }
  };

  const saveTitle = async (nextTitle: string) => {
    if (!state) {
      return;
    }

    await saveMetadata({
      title: nextTitle,
      description: lastDescriptionRef.current ?? '',
      allowOptionChangeAfterVoting: state.game.allowOptionChangeAfterVoting ?? false,
      randomizeStageOrder: state.game.randomizeStageOrder ?? false,
      randomizeOptionOrder: state.game.randomizeOptionOrder ?? false,
    });
  };

  const saveDescription = async (nextDescription: string) => {
    if (!state) {
      return;
    }

    await saveMetadata({
      title: state.game.title,
      description: nextDescription,
      allowOptionChangeAfterVoting: state.game.allowOptionChangeAfterVoting ?? false,
      randomizeStageOrder: state.game.randomizeStageOrder ?? false,
      randomizeOptionOrder: state.game.randomizeOptionOrder ?? false,
    });
  };

  const deleteGame = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await gateway.deleteGame(gameTypeId);
      navigate('/workspace/dashboard');
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : t(`${translationRoot}.deleteError`),
      );
      setIsSaving(false);
    }
  };

  const requestDeleteGame = () => {
    if (!state) {
      return;
    }
    setPendingConfirm({ kind: 'deleteGame', title: state.game.title });
    void confirmDialog
      .requestConfirmation(
        t(`${translationRoot}.deleteGameConfirmMessage`, { title: state.game.title }),
      )
      .then(async (confirmed) => {
        setPendingConfirm(null);
        if (confirmed) {
          await deleteGame();
        }
      });
  };

  const saveItem = async () => {
    if (!state || editorState.text.trim().length === 0) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const itemInput = createPlayableItemInput(editorState, itemKindConfig, t);
      if (editorState.id) {
        const savedItem = await gateway.updateItem(editorState.id, itemInput);
        setState({
          ...state,
          items: state.items.map((item) => (item.id === savedItem.id ? savedItem : item)),
        });
        setEditorState(createPlayableItemEditorStateFromItem(savedItem, itemKindConfig));
      } else {
        const inputAtEnd: PlayableManagementItemInput = {
          ...itemInput,
          position: itemInput.position ?? state.items.length,
        };
        const savedItem = await gateway.createItem(gameTypeId, inputAtEnd);
        setState({
          ...state,
          items: [...state.items, savedItem].sort((left, right) => left.position - right.position),
          game: { ...state.game, itemCount: state.game.itemCount + 1 },
        });
        setSelectedItemId(null);
        setEditorState(createEmptyPlayableItemEditorState(itemKindConfig));
      }
      pulseSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t(`${translationRoot}.saveError`));
    } finally {
      setIsSaving(false);
    }
  };

  const insertItemAt = async (position: number) => {
    if (!state) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const blank = createEmptyPlayableItemEditorState(itemKindConfig);
      const baseInput = createPlayableItemInput({ ...blank, text: ' ' }, itemKindConfig, t);
      const itemInput: PlayableManagementItemInput = {
        ...baseInput,
        text: '',
        position,
      };
      const created = await gateway.createItem(gameTypeId, itemInput);
      const reindexed = [...state.items, created]
        .sort((left, right) => left.position - right.position)
        .map((item, index) => ({ ...item, position: index }));
      setState({
        ...state,
        items: reindexed,
        game: { ...state.game, itemCount: state.game.itemCount + 1 },
      });
      const insertedFresh = reindexed.find((candidate) => candidate.id === created.id) ?? created;
      setSelectedItemId(insertedFresh.id);
      setEditorState(createPlayableItemEditorStateFromItem(insertedFresh, itemKindConfig));
      pulseSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t(`${translationRoot}.saveError`));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: PlayableManagementItem) => {
    if (!state) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await gateway.deleteItem(item.id);
      const remaining = state.items
        .filter((candidate) => candidate.id !== item.id)
        .map((candidate, index) => ({ ...candidate, position: index }));
      setState({
        ...state,
        items: remaining,
        game: { ...state.game, itemCount: Math.max(0, state.game.itemCount - 1) },
      });
      if (selectedItemId === item.id) {
        const fallback = remaining[0] ?? null;
        if (fallback) {
          setSelectedItemId(fallback.id);
          setEditorState(createPlayableItemEditorStateFromItem(fallback, itemKindConfig));
        } else {
          setSelectedItemId(null);
          setEditorState(createEmptyPlayableItemEditorState(itemKindConfig));
        }
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : t(`${translationRoot}.deleteError`),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteItem = (item: PlayableManagementItem) => {
    setPendingConfirm({ kind: 'deleteItem', item });
    void confirmDialog
      .requestConfirmation(
        t(`${translationRoot}.deleteItemConfirmMessage`, {
          text: item.text || t(`${translationRoot}.itemUntitled`),
        }),
      )
      .then(async (confirmed) => {
        setPendingConfirm(null);
        if (confirmed) {
          await deleteItem(item);
        }
      });
  };

  const updateItemPosition = async (item: PlayableManagementItem, position: number) => {
    const itemEditorState = createPlayableItemEditorStateFromItem(item, itemKindConfig);
    const itemInput = createPlayableItemInput(itemEditorState, itemKindConfig, t);
    await gateway.updateItem(item.id, { ...itemInput, position });
  };

  const reorderItems = async (fromIndex: number, toIndex: number) => {
    if (!state || fromIndex === toIndex) {
      return;
    }
    const moved = state.items[fromIndex];
    if (!moved) {
      return;
    }
    const reordered = [...state.items];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const reindexed = reordered.map((item, index) => ({ ...item, position: index }));
    const previous = state;
    setState({ ...state, items: reindexed });
    setIsSaving(true);
    setError(null);
    try {
      const highestPosition = Math.max(...state.items.map((item) => item.position), -1);
      const temporaryPosition = highestPosition + 1;

      await updateItemPosition(moved, temporaryPosition);

      if (fromIndex < toIndex) {
        for (const item of state.items.slice(fromIndex + 1, toIndex + 1)) {
          await updateItemPosition(item, item.position - 1);
        }
      } else {
        for (const item of state.items.slice(toIndex, fromIndex)) {
          await updateItemPosition(item, item.position + 1);
        }
      }

      await updateItemPosition(moved, toIndex);
      pulseSaved();
    } catch (reorderError) {
      setState(previous);
      setError(
        reorderError instanceof Error ? reorderError.message : t(`${translationRoot}.saveError`),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmTitle =
    pendingConfirm?.kind === 'deleteGame'
      ? t(`${translationRoot}.deleteGameConfirmTitle`)
      : pendingConfirm?.kind === 'deleteItem'
        ? t(`${translationRoot}.deleteItemConfirmTitle`)
        : '';
  const confirmAction =
    pendingConfirm?.kind === 'deleteGame'
      ? t(`${translationRoot}.deleteGameConfirmAction`)
      : pendingConfirm?.kind === 'deleteItem'
        ? t(`${translationRoot}.deleteItemConfirmAction`)
        : '';

  return {
    confirmDialog: {
      ...confirmDialog.dialogState,
      title: confirmTitle,
      confirmLabel: confirmAction,
      cancelLabel: t(`${translationRoot}.confirmCancel`),
      onConfirm: confirmDialog.confirm,
      onCancel: confirmDialog.cancel,
    },
    editorState,
    error,
    insertItemAt,
    isLoading,
    isSaving,
    navigateBack: () => navigate('/workspace/dashboard'),
    reorderItems,
    requestDeleteGame,
    requestDeleteItem,
    saveDescription,
    saveMetadata,
    saveItem,
    saveTitle,
    savedPulseAt,
    selectedItemId,
    selectItem,
    setEditorState,
    state,
  };
}
