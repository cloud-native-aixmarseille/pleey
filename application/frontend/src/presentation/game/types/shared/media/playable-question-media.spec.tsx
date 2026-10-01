import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlayableQuestionMedia } from './playable-question-media';

describe('PlayableQuestionMedia', () => {
  it('renders the optimized CDN image within the available width and height without cropping', () => {
    // Arrange
    const media = { mimeType: 'image/webp', uri: 'https://cdn.example.com/quiz/image-1.webp' };

    // Act
    render(<PlayableQuestionMedia media={media} questionText="Question image" />);

    // Assert
    const image = screen.getByRole('img', { name: 'Question image' });
    expect(image).toHaveAttribute('src', media.uri);
    expect(image).toHaveStyle('max-height: 320px; max-width: 100%; min-width: 0; object-fit: contain; width: 100%');
  });

  it.each([
    { mimeType: 'audio/mpeg', uri: 'https://cdn.example.com/quiz/audio-1.mp3', tagName: 'AUDIO' },
    { mimeType: 'video/mp4', uri: 'https://cdn.example.com/quiz/video-1.mp4', tagName: 'VIDEO' },
  ])('plays $mimeType directly from the CDN with native controls and published MIME metadata', (media) => {
    // Arrange + Act
    render(<PlayableQuestionMedia media={media} questionText="Question prompt" />);

    // Assert
    const player = screen.getByLabelText('Question prompt');
    expect(player.tagName).toBe(media.tagName);
    expect(player).toHaveAttribute('controls');
    expect(player).toHaveAttribute('preload', 'metadata');
    expect(player.querySelector('source')).toHaveAttribute('src', media.uri);
    expect(player.querySelector('source')).toHaveAttribute('type', media.mimeType);
    expect(player.querySelector('track')).toBeNull();
    expect(player).toHaveStyle('max-width: 100%; min-width: 0; width: 100%');
  });

  it('keeps the entire video visible within the shared height limit', () => {
    // Arrange + Act
    render(
      <PlayableQuestionMedia
        media={{ mimeType: 'video/mp4', uri: 'https://cdn.example.com/quiz/portrait-1.mp4' }}
        questionText="Question video"
      />,
    );

    // Assert
    expect(screen.getByLabelText('Question video')).toHaveStyle('max-height: 320px; object-fit: contain');
  });

  it('recreates playback when the immutable CDN asset changes', () => {
    // Arrange
    const { rerender } = render(
      <PlayableQuestionMedia
        media={{ mimeType: 'audio/mpeg', uri: 'https://cdn.example.com/quiz/audio-1.mp3' }}
        questionText="Question audio"
      />,
    );
    const previousPlayer = screen.getByLabelText('Question audio');

    // Act
    rerender(
      <PlayableQuestionMedia
        media={{ mimeType: 'audio/mpeg', uri: 'https://cdn.example.com/quiz/audio-2.mp3' }}
        questionText="Question audio"
      />,
    );

    // Assert
    expect(previousPlayer).not.toBeInTheDocument();
    expect(screen.getByLabelText('Question audio').querySelector('source')).toHaveAttribute(
      'src',
      'https://cdn.example.com/quiz/audio-2.mp3',
    );
  });
});
