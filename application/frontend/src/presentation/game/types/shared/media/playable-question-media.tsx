import type { PlayableMedia } from '../../../../../domains/game/types/shared/management/playable-management';
import type { MediaAccessGrant } from '../../../../../domains/media/ports/media-access.port';
import { useMediaAccessGrant } from '../../../../shared/media/use-media-access-grant';
import { MediaPreview } from '../../../../shared/ui/media/media-preview';

interface PlayableQuestionMediaProps {
  readonly maxHeight?: string;
  readonly media: PlayableMedia | null | undefined;
  readonly questionText: string;
  readonly sizing?: 'fill' | 'fit';
  readonly testId?: string;
}

function ProtectedQuestionMedia({
  maxHeight,
  media,
  questionText,
  sizing,
  testId,
}: Omit<PlayableQuestionMediaProps, 'media'> & { readonly media: MediaAccessGrant }) {
  const grant = useMediaAccessGrant(media);
  return grant ? (
    <MediaPreview
      label={questionText.trim()}
      maxHeight={maxHeight}
      mimeType={grant.mimeType}
      sizing={sizing}
      src={grant.uri}
      testId={testId}
    />
  ) : null;
}

export function PlayableQuestionMedia({ maxHeight, media, questionText, sizing, testId }: PlayableQuestionMediaProps) {
  if (!media) return null;
  if (media.id || media.expiresAt) {
    if (!media.id || !media.expiresAt) return null;
    return (
      <ProtectedQuestionMedia
        key={`${media.partyId ?? 'editor'}:${media.id}`}
        maxHeight={maxHeight}
        media={{ ...media, id: media.id, expiresAt: media.expiresAt }}
        questionText={questionText}
        sizing={sizing}
        testId={testId}
      />
    );
  }
  return (
    <MediaPreview
      key={media.uri}
      label={questionText.trim()}
      maxHeight={maxHeight}
      mimeType={media.mimeType}
      sizing={sizing}
      src={media.uri}
      testId={testId}
    />
  );
}
