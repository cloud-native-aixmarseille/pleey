import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { PredictionManagementMetadataSection } from './prediction-management-metadata-section';

describe('PredictionManagementMetadataSection', () => {
  it('renders the game title, fallback description, and created-at text', () => {
    renderWithUiProvider(
      <PredictionManagementMetadataSection
        createdAtText="Created on Mar 15, 2026"
        description="Manage the prediction setup before launch."
        fallbackDescription="No description yet."
        game={{
          gameId: 7,
          type: 'prediction',
          title: 'Q4 market forecast',
          description: null,
          createdAt: '2026-03-15T10:00:00.000Z',
          relatedGameId: 17,
          stageCount: 3,
        }}
        title="Prediction metadata"
      />,
    );

    expect(screen.getByText('Prediction metadata')).toBeInTheDocument();
    expect(screen.getByText('Manage the prediction setup before launch.')).toBeInTheDocument();
    expect(screen.getByText('Q4 market forecast')).toBeInTheDocument();
    expect(screen.getByText('No description yet.')).toBeInTheDocument();
    expect(screen.getByText('Created on Mar 15, 2026')).toBeInTheDocument();
  });

  it('prefers the game description when one exists', () => {
    renderWithUiProvider(
      <PredictionManagementMetadataSection
        createdAtText="Created on Mar 15, 2026"
        description="Manage the prediction setup before launch."
        fallbackDescription="No description yet."
        game={{
          gameId: 7,
          type: 'prediction',
          title: 'Q4 market forecast',
          description: 'Regional sales projection',
          createdAt: '2026-03-15T10:00:00.000Z',
          relatedGameId: 17,
          stageCount: 3,
        }}
        title="Prediction metadata"
      />,
    );

    expect(screen.getByText('Regional sales projection')).toBeInTheDocument();
    expect(screen.queryByText('No description yet.')).not.toBeInTheDocument();
  });
});
