export class PinAlreadyInUseError extends Error {
  constructor(message = 'Game session PIN already in use') {
    super(message);
    this.name = 'PinAlreadyInUseError';
  }
}
