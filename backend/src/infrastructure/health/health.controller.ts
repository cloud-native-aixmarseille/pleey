import { Controller, Get } from '@nestjs/common';
import {
  type DiskHealthIndicator,
  HealthCheck,
  type HealthCheckService,
  type MemoryHealthIndicator,
} from '@nestjs/terminus';
import type { PrismaHealthIndicator } from './prisma-health.indicator';

/**
 * Health check controller
 * Provides endpoints for monitoring application health
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
  ) {}

  /**
   * Basic health check endpoint
   * Checks database, disk, and memory health
   * @returns Health check results
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check database connection
      () => this.prismaHealthIndicator.isHealthy('database'),

      // Check disk storage (90% threshold)
      () =>
        this.diskHealthIndicator.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),

      // Check heap memory usage (heap should not exceed 300MB)
      () => this.memoryHealthIndicator.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Check RSS memory usage (RSS should not exceed 500MB)
      () => this.memoryHealthIndicator.checkRSS('memory_rss', 500 * 1024 * 1024),
    ]);
  }

  /**
   * Readiness probe endpoint
   * Checks if the application is ready to receive traffic
   * @returns Health check results
   */
  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      // Only check database for readiness
      () => this.prismaHealthIndicator.isHealthy('database'),
    ]);
  }

  /**
   * Liveness probe endpoint
   * Checks if the application is alive
   * Returns 200 OK if the application is running
   * @returns Health check results
   */
  @Get('live')
  @HealthCheck()
  live() {
    return this.health.check([
      // Check memory to ensure app hasn't crashed
      () => this.memoryHealthIndicator.checkHeap('memory_heap', 500 * 1024 * 1024),
    ]);
  }
}
