import { Inject, Injectable } from '@nestjs/common';
import { QuizQuestionMediaPolicy } from '../../../../../domain/game/types/quiz/services/quiz-question-media-policy';
import { Media } from '../../../../../domain/media/entities/media';
import type { MediaUploadSource } from '../../../../media/ports/media-upload-source.port';

@Injectable()
export class QuizQuestionMediaPreparationService {
  constructor(@Inject(QuizQuestionMediaPolicy) private readonly policy: QuizQuestionMediaPolicy) {}

  async prepare(source: MediaUploadSource | null | undefined): Promise<Media | null | undefined> {
    if (source == null) return source;

    const upload = await source.open(this.policy.maxFileSizeBytes);
    this.policy.assertMimeType(upload.mimeType, upload.fileName);

    const content = await upload.readContent();
    this.policy.assertContentSize(content.byteLength, upload.fileName, upload.mimeType);

    return new Media(null, upload.mimeType, content);
  }
}
