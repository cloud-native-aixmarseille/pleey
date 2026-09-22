import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { DeliverPasswordResetUseCase } from '../../../application/identity/recovery/use-cases/deliver-password-reset-use-case';
import {
  type PasswordRecoveryPort,
  PasswordRecoveryPortProvider,
} from '../../../domain/identity/ports/password-recovery.port';

@Injectable()
export class PasswordResetDeliveryWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PasswordResetDeliveryWorker.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(
    private readonly deliver: DeliverPasswordResetUseCase,
    @Inject(PasswordRecoveryPortProvider) private readonly recovery: PasswordRecoveryPort,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.drain(), 5_000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  private async drain(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.recovery.deleteExpiredRequests();
      for (let count = 0; count < 10; count++) {
        if (!(await this.deliver.execute())) break;
      }
    } catch {
      this.logger.warn('Password reset delivery failed; pending requests will be retried.');
    } finally {
      this.running = false;
    }
  }
}
