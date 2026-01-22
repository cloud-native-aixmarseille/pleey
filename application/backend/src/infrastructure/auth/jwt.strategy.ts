import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UserId } from '../../domain/auth/entities/user.entity';
import type { AvatarUri } from '../../domain/auth/types/avatar-uri';
import { getRequiredEnvOrFile } from '../shared/env-secret.util';

interface JwtPayload {
  id: UserId;
  username: string;
  isAdmin: boolean;
  avatarUri: AvatarUri | null;
}

/**
 * JWT strategy responsible for validating bearer tokens and
 * hydrating the request with the decoded payload.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    let secret: string;
    try {
      secret = getRequiredEnvOrFile('JWT_SECRET');
    } catch {
      throw new UnauthorizedException('JWT secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
