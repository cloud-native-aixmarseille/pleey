import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import Confetti from "../Confetti";

describe("Confetti", () => {
  it("renders without crashing", () => {
    const { container } = render(<Confetti />);
    expect(container).toBeInTheDocument();
  });

  it("creates a fixed overlay container", () => {
    const { container } = render(<Confetti />);
    const overlay = container.querySelector(".fixed.inset-0");
    expect(overlay).toBeInTheDocument();
  });

  it("has pointer-events-none for accessibility", () => {
    const { container } = render(<Confetti />);
    const overlay = container.querySelector(".pointer-events-none");
    expect(overlay).toBeInTheDocument();
  });

  it("is hidden from screen readers", () => {
    const { container } = render(<Confetti />);
    const ariaHidden = container.querySelector('[aria-hidden="true"]');
    expect(ariaHidden).toBeInTheDocument();
  });

  it("generates confetti pieces", async () => {
    const { container } = render(<Confetti />);

    await waitFor(() => {
      const pieces = container.querySelectorAll('[aria-hidden="true"] > div');
      expect(pieces.length).toBeGreaterThan(0);
    });
  });

  it("uses proper z-index layering", () => {
    const { container } = render(<Confetti />);
    const overlay = container.querySelector(".z-50");
    expect(overlay).toBeInTheDocument();
  });
});
