import { Body, Controller, Header, HttpCode, Inject, Param, ParseEnumPipe, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { type CaptchaPort, CaptchaPortProvider } from '../../../application/identity/captcha/ports/captcha.port';
import { CaptchaAction } from '../../../domain/identity/enums/captcha-action.enum';
import { CaptchaProofInput } from './types/captcha-proof-input';

@Controller('api/identity/captcha')
export class CaptchaController {
  constructor(@Inject(CaptchaPortProvider) private readonly captcha: CaptchaPort) {}

  @Post(':action/challenge')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  challenge(@Param('action', new ParseEnumPipe(CaptchaAction)) action: CaptchaAction, @Req() request: Request) {
    return this.captcha.challenge(action, request.ip ?? 'unknown');
  }

  @Post(':action/redeem')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  redeem(
    @Param('action', new ParseEnumPipe(CaptchaAction)) action: CaptchaAction,
    @Body() proof: CaptchaProofInput,
    @Req() request: Request,
  ) {
    return this.captcha.redeem(action, proof, request.ip ?? 'unknown');
  }
}
