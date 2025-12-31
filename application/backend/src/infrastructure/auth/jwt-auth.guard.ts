import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard enforcing JWT authentication on protected routes.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
