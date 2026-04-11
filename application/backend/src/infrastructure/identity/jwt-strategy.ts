import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UserId } from '../../domain/identity/entities/user';
import { AUTH_JWT_SECRET } from './auth-jwt-secret.token';

interface JwtPayload {
  id: UserId;
  username: string;
}

/**
 * JWT strategy responsible for validating bearer tokens and
 * hydrating the request with the decoded payload.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AUTH_JWT_SECRET) secret: string) {
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
