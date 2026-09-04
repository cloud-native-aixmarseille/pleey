import { type BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class ApplicationHealthIndicator implements BeforeApplicationShutdown {
  private isShuttingDown = false;

  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  beforeApplicationShutdown(): void {
    this.isShuttingDown = true;
  }

  isLive(key: string): HealthIndicatorResult {
    return this.healthIndicatorService.check(key).up();
  }

  isReady(key: string): HealthIndicatorResult {
    const indicator = this.healthIndicatorService.check(key);

    if (this.isShuttingDown) {
      return indicator.down({ reason: 'shutting_down' });
    }

    return indicator.up();
  }
}
