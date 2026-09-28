export function formatFileFormat(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  const extension = dotIndex >= 0 ? fileName.slice(dotIndex + 1) : '';

  return extension ? extension.toUpperCase() : 'FILE';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes < 10 ? 1 : 0)} KB`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(megabytes < 10 ? 1 : 0)} MB`;
}

export function formatMimeTypeFormat(mimeType: string): string {
  const slashIndex = mimeType.lastIndexOf('/');
  const subtype = slashIndex >= 0 ? mimeType.slice(slashIndex + 1) : mimeType;
  const normalized = subtype.replace(/^x-/, '').replace(/^vnd\./, '');

  return normalized ? normalized.toUpperCase() : 'FILE';
}
