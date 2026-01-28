import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { PredictionManagementScreen } from './prediction-management-screen';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: mocks.navigate,
    params: { predictionId: '17' },
  });
});

function createProjectPredictionGame(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: 17,
    gameId: 7,
    type: 'prediction',
    title: 'Q4 market forecast',
    description: 'Regional sales projection',
    createdAt: '2026-03-15T10:00:00.000Z',
    relatedGameId: 17,
    stageCount: 0,
    ...overrides,
  };
}

function createPrompt(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: 13,
    predictionId: 17,
    position: 1,
    promptText: 'Where will revenue land?',
    options: [
      { id: 1, text: 'Above target', position: 1, isCorrect: true },
      { id: 2, text: 'Below target', position: 2, isCorrect: false },
    ],
    timeLimit: 30,
    points: 100,
    ...overrides,
  };
}

function optionLabel(label: string): string {
  return `prediction.management.optionLabel (label=${label})`;
}

describe('PredictionManagementScreen', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    vi.restoreAllMocks();
  });

  it('renders the page header with subtitle', async () => {
    renderWithProviders(
      <PredictionManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadPredictionManagementData={vi.fn().mockResolvedValue({
          predictionGame: createProjectPredictionGame(),
          prompts: [],
        })}
        createPredictionPrompt={vi.fn()}
        updatePredictionPrompt={vi.fn()}
        deletePredictionPrompt={vi.fn()}
      />,
    );

    expect(await screen.findByText('prediction.management.title')).toBeInTheDocument();
    expect(screen.getByText('prediction.management.subtitle')).toBeInTheDocument();
  });

  it('shows the management context bar with prediction identity', async () => {
    renderWithProviders(
      <PredictionManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadPredictionManagementData={vi.fn().mockResolvedValue({
          predictionGame: createProjectPredictionGame(),
          prompts: [createPrompt()],
        })}
        createPredictionPrompt={vi.fn()}
        updatePredictionPrompt={vi.fn()}
        deletePredictionPrompt={vi.fn()}
      />,
    );

    const contextBar = await screen.findByRole('banner', {
      name: 'prediction.management.contextBarLabel',
    });
    expect(contextBar).toBeInTheDocument();
    expect(within(contextBar).getByText('Q4 market forecast')).toBeInTheDocument();
  });

  it('loads the restored prediction game and its prompts', async () => {
    const loadPredictionManagementData = vi.fn().mockResolvedValue({
      predictionGame: createProjectPredictionGame(),
      prompts: [createPrompt()],
    });

    renderWithProviders(
      <PredictionManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadPredictionManagementData={loadPredictionManagementData}
        createPredictionPrompt={vi.fn()}
        updatePredictionPrompt={vi.fn()}
        deletePredictionPrompt={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole('banner', { name: 'prediction.management.contextBarLabel' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('1. Where will revenue land?')).toBeInTheDocument();
    expect(loadPredictionManagementData).toHaveBeenCalledWith(17);
  });

  it('navigates back to the dashboard', async () => {
    renderWithProviders(
      <PredictionManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadPredictionManagementData={vi.fn().mockResolvedValue({
          predictionGame: createProjectPredictionGame(),
          prompts: [],
        })}
        createPredictionPrompt={vi.fn()}
        updatePredictionPrompt={vi.fn()}
        deletePredictionPrompt={vi.fn()}
      />,
    );

    await screen.findByRole('banner', { name: 'prediction.management.contextBarLabel' });

    fireEvent.click(screen.getByRole('button', { name: 'prediction.management.backAction' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/workspace/dashboard');
  });

  it('creates, edits, and deletes prediction prompts', async () => {
    const createPredictionPrompt = vi.fn().mockResolvedValue({
      id: 18,
      predictionId: 17,
      position: 2,
      promptText: 'Created prompt',
      options: [
        { id: 11, text: 'North region', position: 1, isCorrect: false },
        { id: 12, text: 'South region', position: 2, isCorrect: true },
        { id: 13, text: null, position: 3, isCorrect: false },
        { id: 14, text: null, position: 4, isCorrect: false },
      ],
      timeLimit: 45,
      points: 150,
    });
    const updatePredictionPrompt = vi.fn().mockResolvedValue({
      id: 13,
      predictionId: 17,
      position: 1,
      promptText: 'Edited prompt',
      options: [
        { id: 1, text: 'Alpha', position: 1, isCorrect: true },
        { id: 2, text: 'Beta', position: 2, isCorrect: false },
        { id: 3, text: null, position: 3, isCorrect: false },
        { id: 4, text: null, position: 4, isCorrect: false },
      ],
      timeLimit: 50,
      points: 250,
    });
    const deletePredictionPrompt = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <PredictionManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadPredictionManagementData={vi.fn().mockResolvedValue({
          predictionGame: createProjectPredictionGame(),
          prompts: [createPrompt({ promptText: 'Original prompt' })],
        })}
        createPredictionPrompt={createPredictionPrompt}
        updatePredictionPrompt={updatePredictionPrompt}
        deletePredictionPrompt={deletePredictionPrompt}
      />,
    );

    await screen.findByText('1. Original prompt');

    fireEvent.change(screen.getByRole('textbox', { name: 'prediction.management.promptLabel' }), {
      target: { value: 'Created prompt' },
    });
    fireEvent.change(screen.getByLabelText(optionLabel('A')), {
      target: { value: 'North region' },
    });
    fireEvent.change(screen.getByLabelText(optionLabel('B')), {
      target: { value: 'South region' },
    });
    fireEvent.change(screen.getByLabelText('prediction.management.correctOptionLabel'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('prediction.management.timeLimitLabel'), {
      target: { value: '45' },
    });
    fireEvent.change(screen.getByLabelText('prediction.management.pointsLabel'), {
      target: { value: '150' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'prediction.management.createPromptAction' }),
    );

    await waitFor(() => {
      expect(createPredictionPrompt).toHaveBeenCalledWith({
        predictionId: 17,
        position: 2,
        promptText: 'Created prompt',
        options: [
          { text: 'North region', position: 1, isCorrect: false },
          { text: 'South region', position: 2, isCorrect: true },
          { text: null, position: 3, isCorrect: false },
          { text: null, position: 4, isCorrect: false },
        ],
        timeLimit: 45,
        points: 150,
      });
    });

    expect(await screen.findByText('2. Created prompt')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'prediction.management.editAction' })[0]);
    fireEvent.change(screen.getByRole('textbox', { name: 'prediction.management.promptLabel' }), {
      target: { value: 'Edited prompt' },
    });
    fireEvent.change(screen.getByLabelText(optionLabel('A')), {
      target: { value: 'Alpha' },
    });
    fireEvent.change(screen.getByLabelText(optionLabel('B')), {
      target: { value: 'Beta' },
    });
    fireEvent.change(screen.getByLabelText('prediction.management.correctOptionLabel'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('prediction.management.timeLimitLabel'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText('prediction.management.pointsLabel'), {
      target: { value: '250' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'prediction.management.updatePromptAction' }),
    );

    await waitFor(() => {
      expect(updatePredictionPrompt).toHaveBeenCalledWith(13, {
        predictionId: 17,
        position: 1,
        promptText: 'Edited prompt',
        options: [
          { id: 1, text: 'Alpha', position: 1, isCorrect: true },
          { id: 2, text: 'Beta', position: 2, isCorrect: false },
          { text: null, position: 3, isCorrect: false },
          { text: null, position: 4, isCorrect: false },
        ],
        timeLimit: 50,
        points: 250,
      });
    });

    expect(await screen.findByText('1. Edited prompt')).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole('button', { name: 'prediction.management.deleteAction' })[0],
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Edited prompt')).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'prediction.management.deleteAction' }),
    );

    await waitFor(() => {
      expect(deletePredictionPrompt).toHaveBeenCalledWith(13);
    });
  });
});
