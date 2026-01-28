import { Controller, Get } from '@nestjs/common';

type HealthPayload = {
  status: string;
};

@Controller('api/health')
export class HealthController {
  @Get()
  health(): HealthPayload {
    return { status: 'ok' };
  }

  @Get('ready')
  ready(): HealthPayload {
    return { status: 'ready' };
  }

  @Get('live')
  live(): HealthPayload {
    return { status: 'up' };
  }
}
