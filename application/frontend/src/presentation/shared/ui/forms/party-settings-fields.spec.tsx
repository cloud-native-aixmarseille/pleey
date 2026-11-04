import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PARTY_SETTINGS } from '../../../../domains/game/party/shared/entities/party-settings';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { PartySettingsFields } from './party-settings-fields';

vi.mock('../../i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createModule();
});

describe('PartySettingsFields', () => {
  it.each([0, 5, 30])('updates reading time to %s seconds while preserving other settings', (seconds) => {
    // Arrange
    const onChange = vi.fn();
    renderWithUiProvider(
      <PartySettingsFields idPrefix="party" settings={DEFAULT_PARTY_SETTINGS} onChange={onChange} />,
    );
    const input = screen.getByRole('combobox', { name: 'game.party.settings.questionReadingTimeLabel' });
    // Act
    fireEvent.change(input, { target: { value: String(seconds) } });
    // Assert
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_PARTY_SETTINGS, questionReadingTimeSeconds: seconds });
    expect(input).toHaveAccessibleDescription('game.party.settings.questionReadingTimeDescription');
  });

  it('disables the reading-time setting when the form is disabled', () => {
    // Arrange + Act
    renderWithUiProvider(
      <PartySettingsFields idPrefix="party" settings={DEFAULT_PARTY_SETTINGS} onChange={vi.fn()} disabled />,
    );
    // Assert
    expect(screen.getByRole('combobox', { name: 'game.party.settings.questionReadingTimeLabel' })).toBeDisabled();
  });
});
