import { Module } from '@nestjs/common';
import { HealthModule } from './infrastructure/health';

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
