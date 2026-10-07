import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils/render-with-providers';
import { ThemeSelectField } from './theme-select-field';

vi.mock('../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('ThemeSelectField', () => {
  it('lists curated themes and inheritance with an accessible label and description', () => {
    // Arrange
    const onChange = vi.fn();
    renderWithProviders(<ThemeSelectField id="event-theme" value={null} onChange={onChange} />);
    const select = screen.getByRole('combobox', { name: 'theme.label' });

    // Act
    fireEvent.change(select, { target: { value: 'solar-grid' } });

    fireEvent.change(select, { target: { value: '' } });

    // Assert
    expect(select).toHaveAccessibleDescription('theme.description');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 'solar-grid');
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });
});
