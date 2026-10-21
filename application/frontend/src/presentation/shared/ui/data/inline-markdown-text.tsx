import { Fragment, type ReactNode } from 'react';

interface InlineMarkdownTextProps {
  readonly text: string;
}

type InlineMarkdownToken =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'bold' | 'italic' | 'strikethrough' | 'code'; readonly children: readonly InlineMarkdownToken[] };

interface InlineMarkdownDelimiter {
  readonly marker: '**' | '__' | '*' | '_' | '~~' | '`';
  readonly kind: 'bold' | 'italic' | 'strikethrough' | 'code';
}

const INLINE_MARKDOWN_DELIMITERS: readonly InlineMarkdownDelimiter[] = [
  { marker: '**', kind: 'bold' },
  { marker: '__', kind: 'bold' },
  { marker: '~~', kind: 'strikethrough' },
  { marker: '`', kind: 'code' },
  { marker: '*', kind: 'italic' },
  { marker: '_', kind: 'italic' },
];

const UNICODE_WHITESPACE = /\s/;
const UNICODE_PUNCTUATION = /[\p{P}\p{S}]/u;

// CommonMark left-/right-flanking rules (https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis)
function computeDelimiterFlanking(before: string | undefined, after: string | undefined): { left: boolean; right: boolean } {
  const beforeIsWhitespace = before === undefined || UNICODE_WHITESPACE.test(before);
  const beforeIsPunctuation = before !== undefined && UNICODE_PUNCTUATION.test(before);
  const afterIsWhitespace = after === undefined || UNICODE_WHITESPACE.test(after);
  const afterIsPunctuation = after !== undefined && UNICODE_PUNCTUATION.test(after);

  return {
    left: !afterIsWhitespace && (!afterIsPunctuation || beforeIsWhitespace || beforeIsPunctuation),
    right: !beforeIsWhitespace && (!beforeIsPunctuation || afterIsWhitespace || afterIsPunctuation),
  };
}

function canOpenDelimiter(text: string, index: number, delimiter: InlineMarkdownDelimiter): boolean {
  if (delimiter.kind === 'code') {
    return true;
  }

  const { left } = computeDelimiterFlanking(text[index - 1], text[index + delimiter.marker.length]);
  const usesUnderscore = delimiter.marker.startsWith('_');

  return usesUnderscore ? left && (text[index - 1] === undefined || UNICODE_WHITESPACE.test(text[index - 1]) || UNICODE_PUNCTUATION.test(text[index - 1])) : left;
}

function canCloseDelimiter(text: string, index: number, delimiter: InlineMarkdownDelimiter): boolean {
  if (delimiter.kind === 'code') {
    return true;
  }

  const before = text[index - 1];
  const after = text[index + delimiter.marker.length];
  const { right } = computeDelimiterFlanking(before, after);
  const usesUnderscore = delimiter.marker.startsWith('_');

  return usesUnderscore
    ? right && (after === undefined || UNICODE_WHITESPACE.test(after) || UNICODE_PUNCTUATION.test(after))
    : right;
}

function findClosingDelimiter(text: string, fromIndex: number, delimiter: InlineMarkdownDelimiter): number {
  let searchIndex = fromIndex;

  for (;;) {
    const closingIndex = text.indexOf(delimiter.marker, searchIndex);
    if (closingIndex === -1) {
      return -1;
    }
    if (closingIndex === fromIndex) {
      searchIndex = closingIndex + delimiter.marker.length;
      continue;
    }
    if (delimiter.kind === 'code') {
      const newlineIndex = text.indexOf('\n', fromIndex);
      if (newlineIndex !== -1 && newlineIndex < closingIndex) {
        return -1;
      }
      return closingIndex;
    }
    if (canCloseDelimiter(text, closingIndex, delimiter)) {
      return closingIndex;
    }
    searchIndex = closingIndex + delimiter.marker.length;
  }
}

function parseInlineMarkdownTokens(text: string): readonly InlineMarkdownToken[] {
  const tokens: InlineMarkdownToken[] = [];
  let buffer = '';
  let index = 0;

  while (index < text.length) {
    const delimiter = INLINE_MARKDOWN_DELIMITERS.find((candidate) => text.startsWith(candidate.marker, index));

    if (delimiter && canOpenDelimiter(text, index, delimiter)) {
      const contentStart = index + delimiter.marker.length;
      const closingIndex = findClosingDelimiter(text, contentStart, delimiter);

      if (closingIndex !== -1) {
        if (buffer) {
          tokens.push({ kind: 'text', value: buffer });
          buffer = '';
        }
        tokens.push({
          kind: delimiter.kind,
          children:
            delimiter.kind === 'code'
              ? [{ kind: 'text', value: text.slice(contentStart, closingIndex) }]
              : parseInlineMarkdownTokens(text.slice(contentStart, closingIndex)),
        });
        index = closingIndex + delimiter.marker.length;
        continue;
      }
    }

    buffer += text[index];
    index += 1;
  }

  if (buffer) {
    tokens.push({ kind: 'text', value: buffer });
  }

  return tokens;
}

function renderInlineMarkdownTokens(tokens: readonly InlineMarkdownToken[]): ReactNode {
  return tokens.map((token, index) => {
    if (token.kind === 'text') {
      return <Fragment key={index}>{token.value}</Fragment>;
    }

    const children = renderInlineMarkdownTokens(token.children);
    if (token.kind === 'bold') {
      return <strong key={index}>{children}</strong>;
    }
    if (token.kind === 'italic') {
      return <em key={index}>{children}</em>;
    }
    if (token.kind === 'strikethrough') {
      return <s key={index}>{children}</s>;
    }
    return <code key={index}>{children}</code>;
  });
}

export function InlineMarkdownText({ text }: InlineMarkdownTextProps) {
  return <>{renderInlineMarkdownTokens(parseInlineMarkdownTokens(text))}</>;
}
