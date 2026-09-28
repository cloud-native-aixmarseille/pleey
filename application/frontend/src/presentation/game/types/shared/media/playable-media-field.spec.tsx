import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { PlayableMediaField } from './playable-media-field';

const baseProps = {
  acceptedMimeTypes: 'image/png,image/webp',
  activePrompt: 'Release to attach',
  discardLabel: 'Discard',
  helpText: 'Images, audio or video up to 5 MiB.',
  media: null,
  mediaFile: null,
  onFileSelect: () => undefined,
  onRemovePersisted: () => undefined,
  pickerLabel: 'Choose question media',
  previewLabel: 'Question media',
  prompt: 'Drop or choose a file',
  questionText: 'What is the capital of France?',
  removeLabel: 'Remove',
  replaceLabel: 'Replace',
  savedLabel: 'Saved',
  unsavedLabel: 'Unsaved',
};

describe('PlayableMediaField', () => {
  it('shows the upload prompt and a picker when no media is attached', () => {
    // Arrange + Act
    renderWithUiProvider(<PlayableMediaField {...baseProps} />);

    // Assert
    expect(screen.getByText('Drop or choose a file')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose question media', { selector: 'input' })).toBeInTheDocument();
    expect(screen.queryByTestId('playable-item-media-preview')).not.toBeInTheDocument();
  });

  it('previews a freshly selected file with its metadata and an unsaved marker', () => {
    // Arrange
    const mediaFile = new File(['bytes'], 'clue.png', { type: 'image/png' });

    // Act
    renderWithUiProvider(<PlayableMediaField {...baseProps} mediaFile={mediaFile} />);

    // Assert
    expect(screen.getByTestId('playable-item-media-preview')).toBeInTheDocument();
    expect(screen.getByText('clue.png')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('Unsaved')).toBeInTheDocument();
  });

  it('discards the pending selection without touching the persisted media', async () => {
    // Arrange
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    const mediaFile = new File(['bytes'], 'clue.png', { type: 'image/png' });
    renderWithUiProvider(<PlayableMediaField {...baseProps} mediaFile={mediaFile} onFileSelect={onFileSelect} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Discard' }));

    // Assert
    expect(onFileSelect).toHaveBeenCalledWith(null);
  });

  it('previews persisted media with a saved marker and removes it on request', async () => {
    // Arrange
    const user = userEvent.setup();
    const onRemovePersisted = vi.fn();
    renderWithUiProvider(
      <PlayableMediaField
        {...baseProps}
        media={{ mimeType: 'image/webp', uri: 'https://cdn.example.com/clue.webp' }}
        onRemovePersisted={onRemovePersisted}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Remove' }));

    // Assert
    expect(screen.getByRole('img', { name: 'What is the capital of France?' })).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(onRemovePersisted).toHaveBeenCalledOnce();
  });

  it('associates the validation error with the picker and announces it', () => {
    // Arrange
    const mediaFile = new File(['bytes'], 'clue.gif', { type: 'image/gif' });

    // Act
    renderWithUiProvider(
      <PlayableMediaField {...baseProps} error="Choose a supported media file." mediaFile={mediaFile} />,
    );

    // Assert
    const input = screen.getByLabelText('Choose question media', { selector: 'input' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Images, audio or video up to 5 MiB. Choose a supported media file.');
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a supported media file.');
  });
});
