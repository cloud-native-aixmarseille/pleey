import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { NodeGameTimerService } from './node-game-timer.service';

describe('NodeGameTimerService (integration)', () => {
  let module: TestingModule;
  let service: NodeGameTimerService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: Logger,
          useValue: new Logger(),
        },
        NodeGameTimerService,
      ],
    }).compile();
    service = module.get(NodeGameTimerService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    await module.close();
  });

  it('fires the callback and clears timer state', async () => {
    vi.useFakeTimers();

    const pin = `pin-${Date.now()}`;

    const callback = vi.fn(async () => {
      // noop
    });

    service.setAnswerRevealTimer(pin, 500, callback);
    expect(service.hasTimer(pin)).toBe(true);

    await vi.runAllTimersAsync();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(service.hasTimer(pin)).toBe(false);
  });

  it('can clear a timer before it fires', async () => {
    vi.useFakeTimers();

    const pin = `pin-${Date.now()}`;

    const callback = vi.fn(async () => {
      // noop
    });

    service.setAnswerRevealTimer(pin, 10_000, callback);
    expect(service.hasTimer(pin)).toBe(true);

    service.clearAnswerRevealTimer(pin);
    expect(service.hasTimer(pin)).toBe(false);

    await vi.runAllTimersAsync();
    expect(callback).toHaveBeenCalledTimes(0);
  });
});
