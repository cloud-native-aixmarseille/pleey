import { Inject, Injectable, Optional } from '@nestjs/common';
import type { Request } from 'express';
import type { PublicUserProfile } from '../../../../application/identity/profile/dto/public-user-profile.dto';
import type { AuthResponseDto } from '../../../../application/identity/session/dto/auth-response-dto';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { AuthTokenResponse } from '../../../../domain/identity/ports/auth-token.service';
import type { UserProfileSnapshot } from '../../../../domain/identity/types/user-profile-snapshot';
import { AUTH_PUBLIC_API_BASE_URL } from '../auth-public-api-base-url.token';

type RequestLike = Pick<Request, 'headers' | 'protocol' | 'get'>;

@Injectable()
export class AuthProfilePresenter {
  constructor(
    @Optional()
    @Inject(AUTH_PUBLIC_API_BASE_URL)
    private readonly configuredApiBaseUrl?: string,
  ) {}

  presentUserProfile(profile: UserProfileSnapshot, request?: RequestLike): PublicUserProfile {
    const { avatarVersion, ...publicProfile } = profile;

    return {
      ...publicProfile,
      avatarUri: avatarVersion ? this.buildAvatarUrl(profile.id, avatarVersion, request) : null,
    };
  }

  presentAuthResponse(response: AuthTokenResponse, request?: RequestLike): AuthResponseDto {
    const { avatarVersion, ...publicUser } = response.user;

    return {
      ...response,
      user: {
        ...publicUser,
        avatarUri: avatarVersion
          ? this.buildAvatarUrl(response.user.id, avatarVersion, request)
          : null,
      },
    };
  }

  private buildAvatarUrl(userId: UserId, avatarVersion: string, request?: RequestLike): string {
    const baseUrl = this.readBaseUrl(request);

    return `${baseUrl}/api/avatars/users/${userId}?v=${avatarVersion}`;
  }

  private readBaseUrl(request?: RequestLike): string {
    const forwardedProto = this.readHeader(request, 'x-forwarded-proto');
    const forwardedHost = this.readHeader(request, 'x-forwarded-host');
    const host = forwardedHost ?? request?.get('host') ?? this.readHeader(request, 'host');
    const protocol = forwardedProto ?? request?.protocol ?? 'http';

    if (host && host.trim().length > 0) {
      return `${protocol}://${host.trim()}`;
    }

    if (this.configuredApiBaseUrl) {
      return this.configuredApiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    }

    return '';
  }

  private readHeader(request: RequestLike | undefined, headerName: string): string | undefined {
    const value = request?.headers[headerName];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.split(',')[0]?.trim();
    }

    if (Array.isArray(value)) {
      const first = value.find((entry) => entry.trim().length > 0);
      return first?.trim();
    }

    return undefined;
  }
}
