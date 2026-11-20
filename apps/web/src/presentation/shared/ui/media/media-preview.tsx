import { useEffect, useLayoutEffect, useRef } from 'react';
import { uiThemeTokens } from '../foundation/ui-theme';

interface MediaPreviewProps {
  readonly label: string;
  readonly maxHeight?: string;
  readonly mimeType: string;
  readonly sizing?: 'fill' | 'fit';
  readonly src: string;
  readonly testId?: string;
}

const visualMediaStyle = {
  background: uiThemeTokens.color.surface.recessed,
  borderRadius: uiThemeTokens.radius.field,
  display: 'block',
  maxHeight: '20rem',
  maxWidth: '100%',
  minWidth: 0,
  objectFit: 'contain',
  width: '100%',
} as const;

const audioMediaStyle = {
  display: 'block',
  maxWidth: '100%',
  minWidth: 0,
  width: '100%',
} as const;

export function MediaPreview({
  label,
  maxHeight = '20rem',
  mimeType,
  sizing = 'fill',
  src,
  testId,
}: MediaPreviewProps) {
  const playerRef = useRef<HTMLMediaElement | null>(null);
  const previousSrc = useRef(src);
  const playback = useRef<{ time: number; paused: boolean } | null>(null);
  const resolvedVisualStyle =
    sizing === 'fit'
      ? { ...visualMediaStyle, height: 'auto', maxHeight, width: 'auto' }
      : { ...visualMediaStyle, maxHeight };
  useLayoutEffect(() => {
    const player = playerRef.current;
    if (previousSrc.current === src || !player) return;
    previousSrc.current = src;
    playback.current ??= { time: player.currentTime, paused: player.paused };
    player.load();
  }, [src]);
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.paused) player.pause();
    };
  }, []);
  const restorePlayback = () => {
    const player = playerRef.current;
    const previous = playback.current;
    playback.current = null;
    if (!player || !previous) return;
    player.currentTime = previous.time;
    if (!previous.paused) void player.play().catch(() => undefined);
  };

  if (mimeType.startsWith('image/')) {
    return <img alt={label} data-testid={testId} src={src} style={resolvedVisualStyle} />;
  }

  if (mimeType.startsWith('audio/')) {
    return (
      <audio
        ref={(element) => {
          playerRef.current = element;
        }}
        onLoadedMetadata={restorePlayback}
        aria-label={label || undefined}
        controls
        data-testid={testId}
        preload="metadata"
        style={audioMediaStyle}
      >
        <source src={src} type={mimeType} />
      </audio>
    );
  }

  if (mimeType.startsWith('video/')) {
    return (
      <video
        ref={(element) => {
          playerRef.current = element;
        }}
        onLoadedMetadata={restorePlayback}
        aria-label={label || undefined}
        controls
        data-testid={testId}
        preload="metadata"
        style={resolvedVisualStyle}
      >
        <source src={src} type={mimeType} />
      </video>
    );
  }

  return null;
}
