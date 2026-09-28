import type { PlayableMedia } from '../../../../../domains/game/types/shared/management/playable-management';

interface PlayableQuestionMediaProps {
  readonly media: PlayableMedia | null | undefined;
  readonly questionText: string;
  readonly testId?: string;
}

const visualMediaStyle = {
  background: 'var(--mantine-color-gray-0)',
  borderRadius: '1rem',
  display: 'block',
  maxHeight: '20rem',
  objectFit: 'contain',
  width: '100%',
} as const;

export function PlayableQuestionMedia({ media, questionText, testId }: PlayableQuestionMediaProps) {
  if (!media) {
    return null;
  }

  const accessibleLabel = questionText.trim();

  if (media.mimeType.startsWith('image/')) {
    return <img alt={accessibleLabel} data-testid={testId} src={media.uri} style={visualMediaStyle} />;
  }

  if (media.mimeType.startsWith('audio/')) {
    return (
      <audio aria-label={accessibleLabel || undefined} controls data-testid={testId} preload="metadata" style={{ width: '100%' }}>
        <source src={media.uri} type={media.mimeType} />
      </audio>
    );
  }

  if (media.mimeType.startsWith('video/')) {
    return (
      <video
        aria-label={accessibleLabel || undefined}
        controls
        data-testid={testId}
        preload="metadata"
        src={media.uri}
        style={visualMediaStyle}
      />
    );
  }

  return null;
}
