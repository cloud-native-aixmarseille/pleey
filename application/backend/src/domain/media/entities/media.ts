import { Buffer } from 'node:buffer';

export type MediaId = string & {
  readonly __identifierBrand: 'MediaId';
};

export class Media {
  constructor(
    public readonly id: MediaId | null,
    public readonly mimeType: string,
    public readonly content: Buffer,
    public readonly createdAt: Date | null = null,
    public readonly updatedAt: Date | null = null,
  ) {}

  versionToken(): string {
    const versionDate = this.updatedAt ?? this.createdAt;
    const versionTimestamp = versionDate?.getTime() ?? 0;
    const versionId = this.id ?? 0;

    return `${versionId}-${versionTimestamp}`;
  }
}
