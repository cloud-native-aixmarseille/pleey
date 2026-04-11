import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { FormDialog } from './form-dialog';

describe('FormDialog', () => {
  function renderFormDialog(overrides: Partial<React.ComponentProps<typeof FormDialog>> = {}) {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    renderWithUiProvider(
      <FormDialog
        banner={<div>Validation failed</div>}
        eyebrow="Projects"
        footer={<button type="submit">Save</button>}
        isOpen
        onClose={onClose}
        onSubmit={onSubmit}
        title="Create project"
        {...overrides}
      >
        <p>Dialog body</p>
      </FormDialog>,
    );

    return { onClose, onSubmit };
  }

  it('renders the dialog chrome and body content when open', async () => {
    renderFormDialog();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Create project')).toBeInTheDocument();
    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('submits the form when the footer submit button is triggered', () => {
    const { onSubmit } = renderFormDialog();
    const form = document.querySelector('form');

    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('renders nothing visible when closed', () => {
    renderFormDialog({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
