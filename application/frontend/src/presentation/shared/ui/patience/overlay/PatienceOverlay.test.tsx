import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { act } from "react";

import { PatiencePlayground } from "../playground/PatiencePlayground";
import { PatienceOverlay } from "./PatienceOverlay";

vi.mock("../registry", () => {
  return {
    PATIENCE_ANIMATIONS: {
      lemmings: ({ container }: { container: HTMLElement | null }) => (
        <div
          data-testid="mock-animation"
          data-has-container={container ? "yes" : "no"}
        />
      ),
    },
  };
});

describe("PatienceOverlay", () => {
  it("does not render before the delay elapses", () => {
    vi.useFakeTimers();

    render(
      <PatiencePlayground>
        <PatienceOverlay active delayMs={1000} />
      </PatiencePlayground>
    );

    expect(screen.queryByTestId("mock-animation")).toBeNull();

    vi.useRealTimers();
  });

  it("renders after the delay and shows an aria-live status", () => {
    vi.useFakeTimers();

    render(
      <PatiencePlayground>
        <PatienceOverlay active delayMs={200} />
      </PatiencePlayground>
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByTestId("mock-animation")).toHaveAttribute(
      "data-has-container",
      "yes"
    );

    expect(screen.getByRole("status")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("does not render when inactive", () => {
    render(
      <PatiencePlayground>
        <PatienceOverlay active={false} delayMs={0} />
      </PatiencePlayground>
    );

    expect(screen.queryByRole("status")).toBeNull();
  });
});
