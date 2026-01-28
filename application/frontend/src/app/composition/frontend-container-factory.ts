import { Container } from 'inversify';

export class FrontendContainerFactory {
  create(): Container {
    return new Container({ defaultScope: 'Singleton' });
  }
}
