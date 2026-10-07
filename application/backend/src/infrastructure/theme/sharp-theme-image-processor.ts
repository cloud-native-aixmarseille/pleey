import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type { ThemeImageProcessorPort } from '../../application/workspace/themes/ports/theme-image-processor.port';
import { ThemeError, ThemeErrorCode } from '../../domain/theme/errors/theme-error';
@Injectable()
export class SharpThemeImageProcessor implements ThemeImageProcessorPort {
  async process(content: Uint8Array, mimeType: string) {
    if (content.length === 0 || content.length > 5 * 1024 * 1024)
      throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'size' });
    const buffer = Buffer.from(content);
    const format = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? 'png'
      : buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255
        ? 'jpeg'
        : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
          ? 'webp'
          : null;
    if (!format || mimeType !== 'image/' + format)
      throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'type' });
    if (format === 'png') {
      for (let offset = 8; offset + 12 <= buffer.length; ) {
        const length = buffer.readUInt32BE(offset);
        if (buffer.toString('ascii', offset + 4, offset + 8) === 'acTL')
          throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'animation' });
        offset += length + 12;
      }
    }
    try {
      const image = sharp(buffer, { limitInputPixels: 16_000_000, failOn: 'warning', animated: true });
      const metadata = await image.metadata();
      if ((metadata.pages ?? 1) !== 1) throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'animation' });
      const { data, info } = await image.rotate().webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
      if (data.length > 5 * 1024 * 1024) throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'outputSize' });
      return { content: data, width: info.width, height: info.height };
    } catch {
      throw new ThemeError(ThemeErrorCode.INVALID_ASSET, { reason: 'decoding' });
    }
  }
}
