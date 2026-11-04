import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
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
    const [red, green, blue] = background.match(/\d+/g)!.map(Number);
    expect(booleanValue ? green : red).toBeGreaterThan(booleanValue ? red : green);
    expect(booleanValue ? green : red).toBeGreaterThan(blue);

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
});
