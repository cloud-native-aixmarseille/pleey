interface FormatLocalizedDateOptions {
  readonly dateStyle?: 'full' | 'long' | 'medium' | 'short';
  readonly locale?: string;
  readonly timeStyle?: 'full' | 'long' | 'medium' | 'short';
  readonly timeZone?: string;
}

export function formatLocalizedDate(
  value: string,
  { dateStyle = 'medium', locale, timeStyle, timeZone }: FormatLocalizedDateOptions = {},
): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle,
    timeZone,
  }).format(parsed);
}
