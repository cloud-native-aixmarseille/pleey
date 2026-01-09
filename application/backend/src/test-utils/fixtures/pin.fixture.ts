import { PIN } from '../../domain/game/entities/pin';

export type PinFixtureParams = {
  value?: string;
};

export const createPinFixture = (params: PinFixtureParams = {}): PIN => {
  return new PIN(params.value ?? '123456');
};
