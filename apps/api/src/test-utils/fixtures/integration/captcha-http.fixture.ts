import 'reflect-metadata';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CaptchaPortProvider } from '../../../application/identity/captcha/ports/captcha.port';
import { CaptchaController } from '../../../presentation/identity/http/captcha-controller';
import { CaptchaFixture } from '../unit/captcha.fixture';

export class CaptchaHttpFixture extends CaptchaFixture {
  private app?: INestApplication;

  async start(trustedProxyCidrs: string[] = []): Promise<void> {
    const module = await Test.createTestingModule({
      controllers: [CaptchaController],
      providers: [{ provide: CaptchaPortProvider, useValue: this.adapter }],
    }).compile();
    this.app = module.createNestApplication({ logger: false });
    this.app.getHttpAdapter().getInstance().set('trust proxy', trustedProxyCidrs);
    this.app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await this.app.init();
  }

  post(path: string) {
    return request(this.app?.getHttpServer()).post(`/api/identity/captcha/${path}`);
  }

  async stop(): Promise<void> {
    await this.app?.close();
  }
}
