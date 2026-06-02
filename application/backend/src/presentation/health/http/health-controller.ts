import { Controller, Get } from '@nestjs/common';
import { HealthCheck, type HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { ApplicationHealthIndicator } from '../../../infrastructure/health/application-health-indicator';
import { PrismaHealthIndicator } from '../../../infrastructure/health/prisma-health-indicator';

@Controller()
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly applicationHealthIndicator: ApplicationHealthIndicator,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

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
    return this.healthCheckService.check([
      () => this.applicationHealthIndicator.isLive('application'),
    ]);
  }

  private runReadinessCheck(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.applicationHealthIndicator.isReady('application'),
      () => this.prismaHealthIndicator.isHealthy('database'),
    ]);
  }
}
