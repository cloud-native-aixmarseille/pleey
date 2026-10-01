import type { PlayableMedia } from '../../../../../domains/game/types/shared/management/playable-management';
import type { MediaAccessGrant } from '../../../../../domains/media/ports/media-access.port';
import { useMediaAccessGrant } from '../../../../shared/media/use-media-access-grant';
import { MediaPreview } from '../../../../shared/ui/media/media-preview';

interface PlayableQuestionMediaProps {
  readonly media: PlayableMedia | null | undefined;
  readonly questionText: string;
  readonly testId?: string;
}

function ProtectedQuestionMedia({
  media,
  questionText,
  testId,
}: Omit<PlayableQuestionMediaProps, 'media'> & { readonly media: MediaAccessGrant }) {
  const grant = useMediaAccessGrant(media);
  return grant ? (
    <MediaPreview label={questionText.trim()} mimeType={grant.mimeType} src={grant.uri} testId={testId} />
  ) : null;
}

export function PlayableQuestionMedia({ media, questionText, testId }: PlayableQuestionMediaProps) {
  if (!media) return null;
  if (media.id || media.expiresAt) {
    if (!media.id || !media.expiresAt) return null;
    return (
      <ProtectedQuestionMedia
        key={`${media.partyId ?? 'editor'}:${media.id}`}
        media={{ ...media, id: media.id, expiresAt: media.expiresAt }}
        questionText={questionText}
        testId={testId}
      />
    );
  }
  return (
    <MediaPreview
      key={media.uri}
      label={questionText.trim()}
      mimeType={media.mimeType}
      src={media.uri}
      testId={testId}
    />
  );
}
