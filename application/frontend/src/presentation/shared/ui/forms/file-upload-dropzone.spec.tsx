import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { FileUploadDropzone } from './file-upload-dropzone';

describe('FileUploadDropzone', () => {
  it('renders the prompt state when no file is selected', () => {
    renderWithUiProvider(
      <FileUploadDropzone
        acceptedFileTypes=".csv,text/csv"
        activePrompt="Drop file now"
        clearFileLabel="Clear file"
        file={null}
        fieldHelpText="CSV only"
        inputAriaLabel="Choose file"
        onFileSelect={() => undefined}
        prompt="Drop a file here"
        replaceFileLabel="Replace file"
      />,
    );

    expect(screen.getByRole('button', { name: 'Choose file' })).toBeInTheDocument();
    expect(screen.getByText('Drop a file here')).toBeInTheDocument();
    expect(screen.getByText('Choose file')).toBeInTheDocument();
    expect(screen.getByText('CSV only')).toBeInTheDocument();
  });

  it('renders a visible label inside the dropzone when provided', () => {
    renderWithUiProvider(
      <FileUploadDropzone
        acceptedFileTypes=".csv,text/csv"
        activePrompt="Drop file now"
        clearFileLabel="Clear file"
        file={null}
        fieldHelpText="CSV only"
        inputAriaLabel="Choose file"
        inputId="import-file"
        label="Import file"
        onFileSelect={() => undefined}
        prompt="Drop a file here"
        replaceFileLabel="Replace file"
      />,
    );

    expect(screen.getByText('Import file')).toBeInTheDocument();
  });

  it('renders selected file details and clears the selection', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    const file = new File(['content'], 'questions.csv', { type: 'text/csv' });

    renderWithUiProvider(
      <FileUploadDropzone
        acceptedFileTypes=".csv,text/csv"
        activePrompt="Drop file now"
        clearFileLabel="Clear file"
        file={file}
        fieldHelpText="CSV only"
        inputAriaLabel="Choose file"
        onFileSelect={onFileSelect}
        prompt="Drop a file here"
        replaceFileLabel="Replace file"
      />,
    );

    expect(screen.getByText('questions.csv')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('7 B')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace file' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear file' }));

    expect(onFileSelect).toHaveBeenCalledWith(null);
  });
});
