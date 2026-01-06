import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ShareButton } from "./ShareButton";

describe("ShareButton", () => {
  const mockTitle = "Test Title";
  const mockText = "Test sharing text";
  const mockUrl = "https://example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders share button", () => {
    render(<ShareButton title={mockTitle} text={mockText} />);
    expect(screen.getByText(/Share/i)).toBeInTheDocument();
  });

  it("calls native share API when available", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareButton title={mockTitle} text={mockText} url={mockUrl} />);

    const shareButton = screen.getByText(/Share/i);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: mockTitle,
        text: mockText,
        url: mockUrl,
      });
    });
  });

  it("shows custom share menu when native share is not available", async () => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ShareButton title={mockTitle} text={mockText} />);

    const shareButton = screen.getByText(/Share/i);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/Share Results/i)).toBeInTheDocument();
    });
  });

  it("displays social media sharing options in custom menu", async () => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ShareButton title={mockTitle} text={mockText} />);

    const shareButton = screen.getByText(/Share/i);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/Share on Twitter/i)).toBeInTheDocument();
      expect(screen.getByText(/Share on Facebook/i)).toBeInTheDocument();
      expect(screen.getByText(/Share on LinkedIn/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy Link/i)).toBeInTheDocument();
    });
  });

  it("closes custom share menu when close button is clicked", async () => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ShareButton title={mockTitle} text={mockText} />);

    const shareButton = screen.getByText(/Share/i);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/Share Results/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText(/Close/i);
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Share Results/i)).not.toBeInTheDocument();
    });
  });

  it("copies link to clipboard when Copy Link is clicked", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ShareButton title={mockTitle} text={mockText} url={mockUrl} />);

    const shareButton = screen.getByText(/Share/i);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/Copy Link/i)).toBeInTheDocument();
    });

    const copyButton = screen.getByText(/Copy Link/i);
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(`${mockText} ${mockUrl}`);
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
    });
  });

  it("opens Twitter share popup with correct URL", async () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(<ShareButton title={mockTitle} text={mockText} url={mockUrl} />);

    const shareButton = screen.getByText(/Share/i);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/Share on Twitter/i)).toBeInTheDocument();
    });

    const twitterButton = screen.getByText(/Share on Twitter/i);
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalled();
    const callArgs = mockOpen.mock.calls[0][0];
    expect(callArgs).toContain("twitter.com/intent/tweet");
    expect(callArgs).toContain(encodeURIComponent(mockText));
  });

  it("uses default URL when not provided", () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });

    render(<ShareButton title={mockTitle} text={mockText} />);

    const shareButton = screen.getByText(/Share/i);
    fireEvent.click(shareButton);

    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        url: window.location.href,
      })
    );
  });
});
