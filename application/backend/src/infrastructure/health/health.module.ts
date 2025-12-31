import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '../database/database.module';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';

/**
 * Health module
 * Provides health check endpoints and indicators
 */
@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
