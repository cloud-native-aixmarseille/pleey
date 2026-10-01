import { Injectable } from '@nestjs/common';
import { MediaErrorCode } from '../../../../domain/media/enums/media-error-code.enum';
import { AbstractErrorCodeHttpStatusService } from '../../../shared/error-handling/abstract-error-code-http-status.service';

@Injectable()
export class MediaErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<MediaErrorCode> {
  constructor() {
    super(Object.values(MediaErrorCode), {
      [MediaErrorCode.INVALID_MEDIA]: 400,
      [MediaErrorCode.MEDIA_BUSY]: 503,
      [MediaErrorCode.MEDIA_UNAVAILABLE]: 503,
    });
  }
}
