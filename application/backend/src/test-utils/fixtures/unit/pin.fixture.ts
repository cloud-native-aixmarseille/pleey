import { PIN } from '../../../domain/game/entities/pin';

type PinFixtureParams = {
  value?: string;
};

export const createPinFixture = (params: PinFixtureParams = {}): PIN =>
  new PIN(params.value ?? '123456');
