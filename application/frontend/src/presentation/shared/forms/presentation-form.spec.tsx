import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../test-utils/render-with-ui-provider';
import { PresentationForm } from './presentation-form';

describe('PresentationForm', () => {
  describe('render()', () => {
    it('delegates submit handling to the provided form runtime', async () => {
      // Arrange
      const handleSubmit = vi.fn().mockResolvedValue(undefined);
      renderWithUiProvider(
        <PresentationForm form={{ handleSubmit }}>
          <button type="submit">Submit</button>
        </PresentationForm>,
      );

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

      // Assert
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
