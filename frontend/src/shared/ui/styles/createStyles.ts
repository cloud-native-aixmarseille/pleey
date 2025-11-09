const CLASS_SEPARATOR = /\s+/g;

export type StyleEntry = Readonly<{
  className: string;
  "data-style-id"?: string;
}>;

export type StyleDefinitions<T extends string> = Record<T, string>;

function normalizeToken(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeClasses(input: string): string {
  return input
    .trim()
    .split(CLASS_SEPARATOR)
    .filter(Boolean)
    .join(" ");
}

export function createStyles<T extends Record<string, string>>(
  componentName: string,
  definitions: T
): Readonly<Record<keyof T, StyleEntry>> {
  const sanitizedComponent = normalizeToken(componentName) || "component";
  const entries = {} as Record<keyof T, StyleEntry>;

  (Object.keys(definitions) as Array<keyof T>).forEach((key, index) => {
    const normalizedKey =
      normalizeToken(String(key)) || `slot-${index + 1}`;
    const className = normalizeClasses(definitions[key]);

    entries[key] = {
      className,
      "data-style-id": `${sanitizedComponent}.${normalizedKey}`,
    };
  });

  return entries;
}

export type StyleInput =
  | StyleEntry
  | null
  | undefined
  | false;

export function mergeStyles(
  ...inputs: StyleInput[]
): StyleEntry {
  const classNames: string[] = [];
  const identifiers: string[] = [];

  inputs.forEach((input) => {
    if (!input) {
      return;
    }

    if (input.className) {
      classNames.push(input.className);
    }

    if (input["data-style-id"]) {
      identifiers.push(input["data-style-id"] as string);
    }
  });

  const className = normalizeClasses(classNames.join(" "));
  const dataStyleId = identifiers.join(" ");

  if (!className) {
    return { className: "" };
  }

  return dataStyleId
    ? { className, "data-style-id": dataStyleId }
    : { className };
}
