import { Controller, Get, Param, Res, StandardSchemaValidationPipe, UsePipes } from '@nestjs/common';
import type { Response } from 'express';
import { GetGuestAvatarPreviewUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-preview-use-case';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import {
  avatarGuestIdParamSchema,
  avatarHttpResponseSchema,
  avatarSeedParamSchema,
  avatarUserIdParamSchema,
  type AvatarGuestIdParam,
  type AvatarHttpResponse,
  type AvatarSeedParam,
  type AvatarUserIdParam,
} from './types/avatar.schemas';

type AvatarContent = {
  readonly content: Uint8Array;
  readonly mimeType: string;
};

@UsePipes(new StandardSchemaValidationPipe())
@Controller('api/avatars')
export class AvatarController {
  constructor(
    private readonly getUserAvatarUseCase: GetUserAvatarUseCase,
    private readonly getGuestAvatarPreviewUseCase: GetGuestAvatarPreviewUseCase,
    private readonly getGuestAvatarUseCase: GetGuestAvatarUseCase,
    private readonly userIdentifier: UserIdentifier,
  ) {}

  @Get('users/:userId')
  async getUserAvatar(
    @Param('userId', { schema: avatarUserIdParamSchema }) userId: AvatarUserIdParam,
    @Res() res: Response,
  ): Promise<void> {
    const avatar = await this.getUserAvatarUseCase.execute(this.userIdentifier.parse(userId));

    this.sendAvatarResponse(res, this.createUserAvatarResponse(avatar));
  }

  @Get('guests/:guestId')
  async getGuestAvatar(
    @Param('guestId', { schema: avatarGuestIdParamSchema }) encodedGuestId: AvatarGuestIdParam,
    @Res() res: Response,
  ): Promise<void> {
    const avatar = await this.getGuestAvatarUseCase.execute(encodedGuestId);

    this.sendAvatarResponse(res, this.createCachedAvatarResponse(avatar));
  }

  @Get('guests/preview/:avatarSeed')
  getGuestAvatarPreview(
    @Param('avatarSeed', { schema: avatarSeedParamSchema }) encodedAvatarSeed: AvatarSeedParam,
    @Res() res: Response,
  ): void {
    const avatar = this.getGuestAvatarPreviewUseCase.execute(encodedAvatarSeed);

    this.sendAvatarResponse(res, this.createCachedAvatarResponse(avatar));
  }

  private createUserAvatarResponse(avatar: AvatarContent): AvatarHttpResponse {
    return avatarHttpResponseSchema.parse({
      content: avatar.content,
      headers: {
        cacheControl: 'no-store, max-age=0, must-revalidate',
        contentType: avatar.mimeType,
        expires: '0',
        pragma: 'no-cache',
      },
    });
  }

  private createCachedAvatarResponse(avatar: AvatarContent): AvatarHttpResponse {
    return avatarHttpResponseSchema.parse({
      content: avatar.content,
      headers: {
        cacheControl: 'public, max-age=60',
        contentType: avatar.mimeType,
      },
    });
  }

  private sendAvatarResponse(res: Response, avatarResponse: AvatarHttpResponse): void {
    res.setHeader('Content-Type', avatarResponse.headers.contentType);
    res.setHeader('Cache-Control', avatarResponse.headers.cacheControl);

    if (avatarResponse.headers.pragma) {
      res.setHeader('Pragma', avatarResponse.headers.pragma);
    }

    if (avatarResponse.headers.expires) {
      res.setHeader('Expires', avatarResponse.headers.expires);
    }

    res.send(avatarResponse.content);
  }
}
