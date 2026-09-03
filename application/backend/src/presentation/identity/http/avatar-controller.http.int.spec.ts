import 'reflect-metadata';
import { type INestApplication, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { GetGuestAvatarPreviewUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-preview-use-case';
import { GetGuestAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-guest-avatar-use-case';
import { GetUserAvatarUseCase } from '../../../application/identity/avatar/use-cases/get-user-avatar-use-case';
import { UserIdentifier } from '../../../application/identity/shared/services/identifiers/user-identifier';
import { Media } from '../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { AvatarController } from './avatar-controller';

const getUserAvatarUseCase = {
  execute: vi.fn(),
};

const getGuestAvatarPreviewUseCase = {
  execute: vi.fn(),
};

const getGuestAvatarUseCase = {
  execute: vi.fn(),
};

const userIdentifier = {
  parse: vi.fn(),
};

@Module({
  controllers: [AvatarController],
  providers: [
    {
      provide: GetUserAvatarUseCase,
      useValue: getUserAvatarUseCase,
    },
    {
      provide: GetGuestAvatarPreviewUseCase,
      useValue: getGuestAvatarPreviewUseCase,
    },
    {
      provide: GetGuestAvatarUseCase,
      useValue: getGuestAvatarUseCase,
    },
    {
      provide: UserIdentifier,
      useValue: userIdentifier,
    },
  ],
})
class TestAvatarHttpModule {}

describe('AvatarController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAvatarHttpModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a user avatar when the user id is a valid uuid', async () => {
    // Arrange
    vi.clearAllMocks();

    const avatar = new Media(null, 'image/svg+xml', Buffer.from('<svg>avatar</svg>', 'utf8'));
    getUserAvatarUseCase.execute.mockResolvedValue(avatar);
    userIdentifier.parse.mockReturnValue(backendTestIdentifiers.user(7));

    // Act
    const response = await request(app.getHttpServer()).get(`/api/avatars/users/${backendTestIdentifiers.user(7)}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
    expect(getUserAvatarUseCase.execute).toHaveBeenCalledWith(backendTestIdentifiers.user(7));
    expect(userIdentifier.parse).toHaveBeenCalledWith(backendTestIdentifiers.user(7));
  });

  it('rejects an invalid user id before the controller runs', async () => {
    // Arrange
    vi.clearAllMocks();

    // Act
    const response = await request(app.getHttpServer()).get('/api/avatars/users/not-a-uuid');

    // Assert
    expect(response.status).toBe(400);
    expect(getUserAvatarUseCase.execute).not.toHaveBeenCalled();
    expect(userIdentifier.parse).not.toHaveBeenCalled();
  });
});
