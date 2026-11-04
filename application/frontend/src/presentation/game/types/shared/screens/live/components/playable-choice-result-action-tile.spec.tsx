import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeFixtureFactory } from '../../../../../../../test-utils/fixtures/theme-fixture-factory';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { PresentationThemePreview } from '../../../../../../shared/ui/provider';
import { PlayableChoiceResultActionTile } from './playable-choice-result-action-tile';

vi.mock('../../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createModule();
});

const copy = {
  actionSlotLabel: 'slot',
  correctBadge: 'correct',
  voteCount: 'votes',
  yourPickBadge: 'yourPick',
};

describe('PlayableChoiceResultActionTile', () => {
  it.each([
    { booleanValue: true, text: 'Vrai' },
    { booleanValue: false, text: 'Faux' },
  ])('preserves the $text color from selection through results', ({ booleanValue, text }) => {
    // Arrange
    const onClick = vi.fn();
    const props = { booleanValue, copy, index: 1, isCorrect: false, isSelected: false, slotCount: 2, text };
    const { rerender } = renderWithUiProvider(<PlayableChoiceResultActionTile {...props} onClick={onClick} />);
    const badge = screen.getByLabelText('slot (letter=B)');
    const background = badge.style.background;
    expect(background).toBe(`var(--ui-color-surface-${booleanValue ? 'recessed' : 'danger'})`);
    expect(badge.style.color).toBe(`var(--ui-color-text-${booleanValue ? 'status-soft' : 'danger'})`);

    // Act
    fireEvent.click(screen.getByRole('button', { name: text }));
    rerender(
      <PlayableChoiceResultActionTile
        {...props}
        isSelected
        isCorrect={!booleanValue}
        actionCount={1}
        actionPercent={100}
      />,
    );

    // Assert
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('slot (letter=B)').style.background).toBe(background);
    expect(screen.getByText('yourPick')).toBeInTheDocument();
    expect(screen.queryByText('correct') !== null).toBe(!booleanValue);
  });

  it.each(['light', 'dark'] as const)('inherits custom %s theme colors in boolean tiles', (colorScheme) => {
    // Arrange
    const success = '#217346';
    const danger = colorScheme === 'light' ? '#fce8ed' : '#571a2b';
    const dangerBorder = colorScheme === 'light' ? '#b42342' : '#fa7b9c';
    const document = new ThemeFixtureFactory().createDocument({
      overrides: {
        colorScales: {
          success: [success, success, success, success, success, success, success, success, success, success],
        },
        semantic: { [colorScheme]: { surface: { danger }, border: { success, danger: dangerBorder } } },
      },
    });

    // Act
    renderWithUiProvider(
      <PresentationThemePreview document={document} colorScheme={colorScheme}>
        <PlayableChoiceResultActionTile
          booleanValue
          copy={copy}
          index={0}
          isCorrect={false}
          isSelected={false}
          slotCount={2}
          text="True"
          testId="true-tile"
        />
        <PlayableChoiceResultActionTile
          booleanValue={false}
          copy={copy}
          index={1}
          isCorrect
          isSelected
          slotCount={2}
          text="False"
          testId="false-tile"
        />
      </PresentationThemePreview>,
    );

    // Assert
    const trueTile = screen.getByTestId('true-tile');
    const falseTile = screen.getByTestId('false-tile');
    const themeRoot = trueTile.closest<HTMLElement>('[data-theme-preview]');
    expect(themeRoot).toHaveAttribute('data-ui-color-scheme', colorScheme);
    expect(themeRoot?.style.getPropertyValue('--ui-color-brand-success')).toBe(success);
    expect(themeRoot?.style.getPropertyValue('--ui-color-border-success')).toBe(success);
    expect(themeRoot?.style.getPropertyValue('--ui-color-surface-danger')).toBe(danger);
    expect(themeRoot?.style.getPropertyValue('--ui-color-border-danger')).toBe(dangerBorder);
    expect(trueTile.style.background).toContain('var(--ui-color-brand-success)');
    expect(trueTile.style.border).toContain('var(--ui-color-border-success)');
    expect(falseTile.style.background).toBe('var(--ui-color-surface-danger)');
    expect(falseTile.style.border).toContain('var(--ui-color-border-danger)');
  });
});
