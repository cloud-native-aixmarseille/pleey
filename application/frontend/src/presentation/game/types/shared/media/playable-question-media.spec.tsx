import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlayableQuestionMedia } from './playable-question-media';

describe('PlayableQuestionMedia', () => {
  it('renders an image when the media mime type is an image', () => {
    // Arrange + Act
    render(
      <PlayableQuestionMedia
        media={{ mimeType: 'image/png', uri: '/api/quiz-questions/1/media?v=1' }}
        questionText="Question image"
      />,
    );

    // Assert
    expect(screen.getByRole('img', { name: 'Question image' })).toHaveAttribute(
      'src',
      '/api/quiz-questions/1/media?v=1',
    );
  });

  it('renders an audio player when the media mime type is audio', () => {
    // Arrange + Act
    render(
      <PlayableQuestionMedia
        media={{ mimeType: 'audio/mpeg', uri: '/api/quiz-questions/1/media?v=2' }}
        questionText="Question audio"
      />,
    );

    // Assert
    const audio = screen.getByLabelText('Question audio');
    expect(audio.tagName).toBe('AUDIO');
    expect(audio.querySelector('track')).toHaveAttribute('kind', 'descriptions');
  });

  it('renders a video player when the media mime type is video', () => {
    // Arrange + Act
    render(
      <PlayableQuestionMedia
        media={{ mimeType: 'video/mp4', uri: '/api/quiz-questions/1/media?v=3' }}
        questionText="Question video"
      />,
    );

    // Assert
    const video = screen.getByLabelText('Question video');
    expect(video.tagName).toBe('VIDEO');
    expect(video.querySelector('track')).toHaveAttribute('kind', 'captions');
  });
});
