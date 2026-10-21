import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineMarkdownText } from './inline-markdown-text';

describe('InlineMarkdownText', () => {
  it('renders bold segments without exposing the markdown delimiters', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="Where **should you** store your secrets?" />);

    // Assert
    const boldSegment = screen.getByText('should you');
    expect(boldSegment.tagName).toBe('STRONG');
    expect(boldSegment).not.toHaveTextContent(/\*/);
    expect(screen.getByText(/store your secrets/)).toBeInTheDocument();
  });

  it('renders italic segments wrapped with single stars', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="Read the *secret* handbook" />);

    // Assert
    expect(screen.getByText('secret').tagName).toBe('EM');
  });

  it('renders italic segments wrapped with underscores', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="Read the _secret_ handbook" />);

    // Assert
    expect(screen.getByText('secret').tagName).toBe('EM');
  });

  it('renders strikethrough segments', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="Never store secrets in ~~plaintext~~ code" />);

    // Assert
    expect(screen.getByText('plaintext').tagName).toBe('S');
  });

  it('renders code segments without interpreting markdown inside them', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="Use `**not-bold**` literally" />);

    // Assert
    const codeSegment = screen.getByText('**not-bold**');
    expect(codeSegment.tagName).toBe('CODE');
    expect(codeSegment.querySelector('strong')).toBeNull();
  });

  it('renders nested emphasis inside bold segments', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="**bold with *italic* inside**" />);

    // Assert
    const italicSegment = screen.getByText('italic');
    expect(italicSegment.tagName).toBe('EM');
    expect(italicSegment.closest('strong')).toHaveTextContent('bold with italic inside');
  });

  it('keeps unmatched delimiters as plain text', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="Where **should you store secrets?" />);

    // Assert
    expect(screen.getByText('Where **should you store secrets?')).toBeInTheDocument();
    expect(document.querySelector('strong')).toBeNull();
  });

  it('keeps empty emphasis as plain text', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="empty **** emphasis" />);

    // Assert
    expect(screen.getByText('empty **** emphasis')).toBeInTheDocument();
    expect(document.querySelector('strong')).toBeNull();
  });

  it('renders raw HTML-like content as inert text', () => {
    // Arrange + Act
    render(<InlineMarkdownText text="<b>not html</b>" />);

    // Assert
    expect(screen.getByText('<b>not html</b>')).toBeInTheDocument();
    expect(document.querySelector('b')).toBeNull();
  });

  it('keeps code spans containing newlines as plain text', () => {
    // Arrange + Act
    const { container } = render(<InlineMarkdownText text={'`line one\nline two`'} />);

    // Assert
    expect(container.querySelector('code')).toBeNull();
    expect(container).toHaveTextContent('`line one line two`');
  });
});
