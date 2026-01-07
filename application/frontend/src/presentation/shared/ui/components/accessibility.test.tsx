import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import PrimaryButton from "./buttons/PrimaryButton";
import Input from "./Input";
import Card from "./Card";

async function expectNoViolations(container: HTMLElement) {
  const results = await axe(container);
  expect(results.violations.length).toBe(0);
}

describe("Accessibility Tests - Shared UI Components", () => {
  describe("Button Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<PrimaryButton>Click Me</PrimaryButton>);
      await expectNoViolations(container);
    });

    it("should have proper disabled state", async () => {
      const { container } = render(
        <PrimaryButton disabled>Disabled Button</PrimaryButton>
      );
      await expectNoViolations(container);
    });
  });

  describe("Input Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <Input label="Username" placeholder="Enter your username" />
      );
      await expectNoViolations(container);
    });

    it("should properly associate label with input", async () => {
      const { container, getByLabelText } = render(
        <Input label="Email" type="email" />
      );

      const input = getByLabelText("Email");
      expect(input).toBeInTheDocument();

      await expectNoViolations(container);
    });

    it("should properly handle error states", async () => {
      const { container } = render(
        <Input label="Password" type="password" error="Password is required" />
      );

      await expectNoViolations(container);
    });
  });

  describe("Card Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <Card surface="panel" variant="primary" elevation="panel">
          <h2>Card Title</h2>
          <p>Card content goes here</p>
        </Card>
      );
      await expectNoViolations(container);
    });

    it("should render as button when onClick is provided", async () => {
      const handleClick = () => {};
      const { container, getByRole } = render(
        <Card onClick={handleClick} interactive variant="primary">
          <h2>Clickable Card</h2>
        </Card>
      );

      const cardButton = getByRole("button");
      expect(cardButton).toBeInTheDocument();
      expect(cardButton).toHaveAttribute("tabindex", "0");

      await expectNoViolations(container);
    });
  });
});
