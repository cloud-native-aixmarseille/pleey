import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, type HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { ApplicationHealthIndicator } from '../../../infrastructure/health/application-health-indicator';
import { PrismaHealthIndicator } from '../../../infrastructure/health/prisma-health-indicator';
import { APP_VERSION } from './app-version.token';

@Controller()
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly applicationHealthIndicator: ApplicationHealthIndicator,
    @Inject(APP_VERSION)
    private readonly applicationVersion: string,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

  @Get('api/version')
  version(): { version: string } {
    return {
      version: this.applicationVersion,
    };
  }

  @Get('healthz')
  @HealthCheck()
  live(): Promise<HealthCheckResult> {
    return this.runLivenessCheck();
  }

  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.runReadinessCheck();
  }

  private runLivenessCheck(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([() => this.applicationHealthIndicator.isLive('application')]);
  }

  private runReadinessCheck(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.applicationHealthIndicator.isReady('application'),
      () => this.prismaHealthIndicator.isHealthy('database'),
    ]);
  }
}
