export class ReactQrCodeMockFactory {
  createModule() {
    return {
      default: ({ value }: { value: string }) => <div data-testid="qr-code">{value}</div>,
    };
  }
}
