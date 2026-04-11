import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { MultiSelect } from './multi-select';

describe('MultiSelect', () => {
  it('renders selected values as chips', () => {
    renderWithUiProvider(
      <MultiSelect
        aria-label="Game types"
        data={[
          { value: 'quiz', label: 'Quiz' },
          { value: 'prediction', label: 'Prediction' },
        ]}
        onChange={() => undefined}
        value={['quiz']}
      />,
    );

    expect(screen.getAllByText('Quiz')).not.toHaveLength(0);
  });

  it('exposes aria-invalid when invalid', () => {
    renderWithUiProvider(
      <MultiSelect
        aria-label="Game types"
        data={[
          { value: 'quiz', label: 'Quiz' },
          { value: 'prediction', label: 'Prediction' },
        ]}
        error="Required"
        onChange={() => undefined}
        value={[]}
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Game types' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
