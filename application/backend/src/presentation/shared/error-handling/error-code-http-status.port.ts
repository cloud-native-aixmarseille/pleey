export interface ErrorCodeHttpStatusPort {
  canResolve(code: string): boolean;
  resolve(code: string): number;
}
