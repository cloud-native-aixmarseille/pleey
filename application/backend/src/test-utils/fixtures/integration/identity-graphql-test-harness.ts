import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { ApolloDriver } from '@nestjs/apollo';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { I18nModule } from 'nestjs-i18n';
import request from 'supertest';
import { afterAll, beforeAll, vi } from 'vitest';
import { IdentityModule } from '../../../app/modules/identity/identity-module';
import { DeliverPasswordResetUseCase } from '../../../application/identity/recovery/use-cases/deliver-password-reset-use-case';
import { LoginUserUseCase } from '../../../application/identity/session/use-cases/login-user-use-case';
import { PasswordService } from '../../../domain/identity/services/password-service';
import { PrismaService } from '../../../infrastructure/database/prisma-service';
import { PasswordResetDeliveryWorker } from '../../../infrastructure/identity/services/password-reset-delivery-worker';
import { SmtpPasswordResetMailer } from '../../../infrastructure/identity/services/smtp-password-reset-mailer';

export class IdentityGraphqlTestHarness {
  private app!: INestApplication;
  private readonly emails: string[] = ['unknown-478@example.com'];
  private readonly organizationIds: string[] = [];
  readonly mailer = { send: vi.fn().mockResolvedValue(undefined) };

  constructor() {
    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [
          I18nModule.forRoot({ fallbackLanguage: 'en', loaderOptions: { path: join(process.cwd(), 'src/i18n') } }),
          GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true }),
          IdentityModule,
        ],
      })
        .overrideProvider(PasswordResetDeliveryWorker)
        .useValue({})
        .overrideProvider(SmtpPasswordResetMailer)
        .useValue(this.mailer)
        .compile();
      this.app = module.createNestApplication({ logger: false });
      this.app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
      await this.app.listen(0, '127.0.0.1');
    });
    afterAll(async () => {
      if (!this.app) return;
      try {
        const gameWhere = { project: { organizationId: { in: this.organizationIds } } };
        await this.prisma.score.deleteMany({ where: { party: { game: gameWhere } } });
        await this.prisma.party.deleteMany({ where: { game: gameWhere } });
        await this.prisma.game.deleteMany({ where: gameWhere });
        await this.prisma.project.deleteMany({ where: { organizationId: { in: this.organizationIds } } });
        await this.prisma.organization.deleteMany({ where: { id: { in: this.organizationIds } } });
        await this.prisma.user.deleteMany({ where: { authentication: { email: { in: this.emails } } } });
      } finally {
        await this.app.close();
      }
    });
  }

  get prisma(): PrismaService {
    return this.app.get(PrismaService);
  }

  async createAccount() {
    const email = `${randomUUID()}@example.com`;
    this.emails.push(email);
    const password = 'original-password';
    const user = await this.prisma.user.create({
      data: {
        username: randomUUID(),
        authentication: { create: { email, password: await this.app.get(PasswordService).hash(password) } },
      },
    });
    const session = await this.app.get(LoginUserUseCase).execute({ email, password });
    return { user: { ...user, email }, session, password };
  }

  async createHistory(ownerId: string, otherId: string) {
    const organization = await this.prisma.organization.create({ data: { name: 'History test' } });
    this.organizationIds.push(organization.id);
    const project = await this.prisma.project.create({
      data: { name: 'History project', organizationId: organization.id },
    });
    const game = await this.prisma.game.create({
      data: { title: 'History quiz', type: 'quiz', projectId: project.id },
    });
    const hosted = await this.prisma.party.create({
      data: { gameId: game.id, hostId: ownerId, pin: randomUUID(), status: 'ENDED', settings: {} },
    });
    const played = await this.prisma.party.create({
      data: {
        gameId: game.id,
        hostId: otherId,
        pin: randomUUID(),
        status: 'ENDED',
        settings: {},
        scores: {
          create: [
            { userId: ownerId, points: 42 },
            { userId: otherId, points: 999 },
          ],
        },
      },
    });
    await this.prisma.party.create({ data: { gameId: game.id, hostId: otherId, pin: randomUUID(), settings: {} } });
    await this.prisma.party.create({
      data: { gameId: game.id, hostId: ownerId, pin: randomUUID(), settings: {}, deletedAt: new Date() },
    });
    return { hosted, played };
  }

  async deliverReset(email: string): Promise<string> {
    await this.app.get(DeliverPasswordResetUseCase).execute();
    return this.mailer.send.mock.calls.find((call) => call[0] === email)?.[1] as string;
  }

  graphql(query: string, variables: Record<string, unknown> = {}, token?: string) {
    const operation = request(this.app.getHttpServer()).post('/graphql');
    if (token) operation.set('Authorization', `Bearer ${token}`);
    return operation.send({ query, variables });
  }
}
