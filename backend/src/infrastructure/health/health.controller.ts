import { Controller, Get } from '@nestjs/common';

/**
 * Minimal health controller
 * Lightweight endpoints that don't require external providers.
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready() {
    return { status: 'ready' };
  }

  @Get('live')
  live() {
    return { status: 'up' };
  }
}
