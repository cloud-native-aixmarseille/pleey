import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameTypeIdentifierMockFactory } from '../../../../../test-utils/mocks/game-type-identifier-mock-factory';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { PlayableContentManagementScreen } from './playable-content-management-screen';

const gameTypeIdentifier = new GameTypeIdentifierMockFactory().create();

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock('../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

vi.mock('../../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/mocks/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: navigateMock,
  });
});

describe('PlayableContentManagementScreen', () => {
  const gateway = {
    createItem: vi.fn(),
    deleteGame: vi.fn(),
    deleteItem: vi.fn(),
    load: vi.fn(),
    updateItem: vi.fn(),
    updateMetadata: vi.fn(),
  };

  beforeEach(() => {
    navigateMock.mockReset();
    gateway.createItem.mockReset();
    gateway.deleteGame.mockReset();
    gateway.deleteItem.mockReset();
    gateway.load.mockReset();
    gateway.updateItem.mockReset();
    gateway.updateMetadata.mockReset();

    gateway.load.mockResolvedValue({
      game: {
        id: 12,
        title: 'Arcade Quiz',
        description: 'Live rounds',
        itemCount: 2,
      },
      items: [
        {
          id: 21,
          kind: 'multiple',
          options: [
            { id: 1, isCorrect: true, position: 0, text: 'A' },
            { id: 2, isCorrect: false, position: 1, text: 'B' },
            { id: 3, isCorrect: false, position: 2, text: 'C' },
            { id: 4, isCorrect: false, position: 3, text: 'D' },
          ],
          points: 1000,
          position: 0,
          text: 'First question',
          timeLimit: 20,
        },
        {
          id: 22,
          kind: 'multiple',
          options: [
            { id: 5, isCorrect: true, position: 0, text: 'One' },
            { id: 6, isCorrect: false, position: 1, text: 'Two' },
          ],
          points: 500,
          position: 1,
          text: 'Second question',
          timeLimit: 15,
        },
      ],
    });
    gateway.createItem.mockResolvedValue({
      id: 23,
      kind: 'multiple',
      options: [
        { id: 7, isCorrect: true, position: 0, text: 'Alpha' },
        { id: 8, isCorrect: false, position: 1, text: 'Beta' },
      ],
      points: 1000,
      position: 2,
      text: 'New question',
      timeLimit: 20,
    });
    gateway.updateItem.mockImplementation(async (itemId, input) => ({
      id: itemId,
      kind: input.kind,
      options: input.options,
      points: input.points,
      position: input.position ?? 0,
      text: input.text,
      timeLimit: input.timeLimit,
    }));
  });

  function renderScreen() {
    return renderWithUiProvider(
      <MemoryRouter>
        <PlayableContentManagementScreen
          gameTypeId={gameTypeIdentifier.parse(12)}
          gateway={gateway}
          itemKindConfig={{
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
          }}
          translationRoot="game.types.quiz.management"
        />
      </MemoryRouter>,
    );
  }

  it('creates an item from the inline editor', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(
      await screen.findByRole('button', { name: 'game.types.quiz.management.createItem' }),
    );
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'New question' } });
    fireEvent.change(textboxes[1], { target: { value: 'Alpha' } });
    fireEvent.change(textboxes[2], { target: { value: 'Beta' } });
    const createButtons = screen.getAllByRole('button', {
      name: 'game.types.quiz.management.createItem',
    });
    await user.click(createButtons[createButtons.length - 1]);

    await waitFor(() => {
      expect(gateway.createItem).toHaveBeenCalledWith(12, {
        kind: 'multiple',
        options: [
          { id: null, isCorrect: true, position: 0, text: 'Alpha' },
          { id: null, isCorrect: false, position: 1, text: 'Beta' },
        ],
        points: 1000,
        position: 2,
        text: 'New question',
        timeLimit: 20,
      });
    });
  });

  it('reorders items from the compact stage rail', async () => {
    const user = userEvent.setup();
    renderScreen();

    const rail = within(
      await screen.findByRole('list', { name: 'game.types.quiz.management.itemsTitle' }),
    );
    await user.click(
      rail.getAllByRole('button', { name: 'game.types.quiz.management.moveItemDownShort' })[0],
    );

    await waitFor(() => {
      expect(gateway.updateItem.mock.calls).toEqual([
        [21, expect.objectContaining({ position: 2, text: 'First question' })],
        [22, expect.objectContaining({ position: 0, text: 'Second question' })],
        [21, expect.objectContaining({ position: 1, text: 'First question' })],
      ]);
    });
  });

  it('switches to the setup tab from the more menu and saves metadata', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(
      await screen.findByRole('button', { name: 'game.types.quiz.management.moreActions' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'game.types.quiz.management.editGame' }));

    const titleField = await screen.findByRole('textbox', {
      name: 'game.types.quiz.management.titleLabel',
    });
    await user.clear(titleField);
    await user.type(titleField, 'Arcade Quiz Updated');
    await user.click(
      screen.getByRole('button', { name: 'game.types.quiz.management.saveMetadata' }),
    );

    await waitFor(() => {
      expect(gateway.updateMetadata).toHaveBeenCalledWith(12, {
        title: 'Arcade Quiz Updated',
        description: 'Live rounds',
      });
    });
  });

  it('shows only available more-menu actions', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(
      await screen.findByRole('button', { name: 'game.types.quiz.management.moreActions' }),
    );
    expect(
      screen.queryByRole('menuitem', { name: 'game.types.quiz.management.activityLog' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'game.types.quiz.management.archiveGame' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: 'game.types.quiz.management.duplicateGame' }),
    ).not.toBeInTheDocument();
  });

  it('switches to the review tab', async () => {
    const user = userEvent.setup();
    renderScreen();

    await user.click(
      await screen.findByRole('tab', { name: 'game.types.quiz.management.tabReview' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'game.types.quiz.management.tabReview' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'game.types.quiz.management.reviewChecklistTitle' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'game.types.quiz.management.reviewItemsTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('Second question')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'game.types.quiz.management.editItem' }),
    ).toHaveLength(2);
  });

  it('surfaces incomplete review items and links back to edit them', async () => {
    const user = userEvent.setup();
    gateway.load.mockResolvedValueOnce({
      game: {
        id: 12,
        title: 'Arcade Quiz',
        description: 'Live rounds',
        itemCount: 2,
      },
      items: [
        {
          id: 21,
          kind: 'multiple',
          options: [
            { id: 1, isCorrect: true, position: 0, text: 'A' },
            { id: 2, isCorrect: false, position: 1, text: 'B' },
          ],
          points: 1000,
          position: 0,
          text: 'Ready question',
          timeLimit: 20,
        },
        {
          id: 22,
          kind: 'multiple',
          options: [{ id: 5, isCorrect: true, position: 0, text: 'One' }],
          points: 500,
          position: 1,
          text: 'Broken question',
          timeLimit: 15,
        },
      ],
    });

    renderScreen();

    await user.click(
      await screen.findByRole('tab', { name: 'game.types.quiz.management.tabReview' }),
    );

    expect(
      screen.getByText('game.types.quiz.management.validation.missingOutcome'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'game.types.quiz.management.goToFirstIssue' }),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByRole('button', { name: 'game.types.quiz.management.editItem' }),
    ).toHaveLength(2);

    await user.click(
      screen.getAllByRole('button', { name: 'game.types.quiz.management.editItem' })[1],
    );

    expect(
      await screen.findByRole('heading', { name: 'game.types.quiz.management.editItemTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Broken question')).toBeInTheDocument();
  });
});
