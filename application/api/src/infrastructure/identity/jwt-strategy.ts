import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_JWT_SECRET } from './auth-jwt-secret.token';
import { JwtSessionAuthenticator } from './services/jwt-session-authenticator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AUTH_JWT_SECRET) secret: string,
    private readonly sessions: JwtSessionAuthenticator,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  validate(payload: unknown) {
    return this.sessions.validate(payload);
  }
}
