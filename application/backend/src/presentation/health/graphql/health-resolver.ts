import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { HealthStatus } from './types/health-status';

function wait(durationInMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationInMs);
  });
}

@Resolver(() => HealthStatus)
export class HealthResolver {
  @Query(() => HealthStatus)
  health(): HealthStatus {
    return { status: 'ok' };
  }

  @Query(() => HealthStatus)
  ready(): HealthStatus {
    return { status: 'ready' };
  }

  @Query(() => HealthStatus)
  live(): HealthStatus {
    return { status: 'up' };
  }

  @Subscription(() => HealthStatus, {
    name: 'healthTick',
    resolve: (payload: HealthStatus) => payload,
  })
  async *subscribeToHealthTick(): AsyncGenerator<HealthStatus> {
    while (true) {
      await wait(5000);
      yield { status: 'ok' };
    }
  }
}
