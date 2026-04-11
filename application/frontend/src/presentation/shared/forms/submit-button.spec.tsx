import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithFormProvider } from '../../../test-utils/render-with-form-provider';
import { PresentationForm } from './presentation-form';
import { SubmitButton } from './submit-button';
import { usePresentationForm } from './use-presentation-form';

function createDeferred() {
  let resolvePromise: (() => void) | undefined;
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve: () => resolvePromise?.(),
  };
}

function SubmitButtonHarness({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const form = usePresentationForm({
    defaultValues: {
      email: '',
    },
    onSubmit,
  });

  return (
    <form.AppForm>
      <PresentationForm form={form}>
        <SubmitButton label="Submit" submittingLabel="Submitting..." />
      </PresentationForm>
    </form.AppForm>
  );
}

describe('SubmitButton', () => {
  describe('render()', () => {
    it('renders the submitting label while the form is pending', async () => {
      // Arrange
      const deferred = createDeferred();
      const onSubmit = vi.fn().mockReturnValue(deferred.promise);
      renderWithFormProvider(<SubmitButtonHarness onSubmit={onSubmit} />);

      // Act
      fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

      // Assert
      expect(await screen.findByRole('button', { name: 'Submitting...' })).toBeDisabled();

      deferred.resolve();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      });
    });
  });
});
