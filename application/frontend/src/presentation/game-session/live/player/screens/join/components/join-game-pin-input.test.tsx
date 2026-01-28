import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { JoinGamePinInput } from './join-game-pin-input';

describe('JoinGamePinInput', () => {
  it('renders the expected number of visual cells', () => {
    renderWithUiProvider(
      <JoinGamePinInput
        id="test-pin"
        maxLength={6}
        onBlur={vi.fn()}
        onChange={vi.fn()}
        placeholder="AB12CD"
        value=""
      />,
    );

    const cells = screen.getAllByText(/^[A-Z0-9]$/);
    expect(cells).toHaveLength(6);
  });

  it('displays typed characters in cells', () => {
    renderWithUiProvider(
      <JoinGamePinInput
        id="test-pin"
        maxLength={6}
        onBlur={vi.fn()}
        onChange={vi.fn()}
        placeholder="AB12CD"
        value="XY"
      />,
    );

    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
  });

  it('fires onChange when the hidden input value changes', () => {
    const onChange = vi.fn();

    renderWithUiProvider(
      <JoinGamePinInput
        id="test-pin"
        maxLength={6}
        onBlur={vi.fn()}
        onChange={onChange}
        placeholder="AB12CD"
        value=""
      />,
    );

    const input = document.getElementById('test-pin') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'AB' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('renders the input element with the correct id for label association', () => {
    renderWithUiProvider(
      <JoinGamePinInput
        id="join-game-pin"
        maxLength={6}
        onBlur={vi.fn()}
        onChange={vi.fn()}
        placeholder="AB12CD"
        value=""
      />,
    );

    expect(document.getElementById('join-game-pin')).toBeInTheDocument();
  });
});
