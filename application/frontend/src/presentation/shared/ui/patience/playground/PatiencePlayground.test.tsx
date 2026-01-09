import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PatiencePlayground } from "./PatiencePlayground";
import { usePatiencePlayground } from "./PatiencePlaygroundContext";

function Probe() {
  const { container } = usePatiencePlayground();
  return (
    <div data-testid="probe" data-has-container={container ? "yes" : "no"} />
  );
}

describe("PatiencePlayground", () => {
  it("provides the playground container via context", async () => {
    render(
      <PatiencePlayground>
        <Probe />
      </PatiencePlayground>
    );

    expect(screen.getByTestId("probe")).toHaveAttribute(
      "data-has-container",
      "yes"
    );
  });

  it("renders the playground wrapper", () => {
    const { container } = render(
      <PatiencePlayground>
        <div>child</div>
      </PatiencePlayground>
    );

    const wrapper = container.querySelector(
      "[data-patience-playground='true']"
    );
    expect(wrapper).toBeTruthy();
  });
});
