import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import Button from "../button/Button";
import Input from "../Input";
import Card from "../Card";

// Extend Vitest's expect with accessibility matchers
expect.extend(matchers);

describe("Accessibility Tests - Shared Components", () => {
  describe("Button Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<Button variant="primary">Click Me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper disabled state", async () => {
      const { container } = render(
        <Button variant="primary" disabled>
          Disabled Button
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Input Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <Input label="Username" placeholder="Enter your username" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should properly associate label with input", async () => {
      const { container, getByLabelText } = render(
        <Input label="Email" type="email" />
      );

      // Verify label is associated with input
      const input = getByLabelText("Email");
      expect(input).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should properly handle error states", async () => {
      const { container } = render(
        <Input label="Password" type="password" error="Password is required" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Card Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <Card variant="default">
          <h2>Card Title</h2>
          <p>Card content goes here</p>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should render as button when onClick is provided", async () => {
      const handleClick = () => {};
      const { container } = render(
        <Card onClick={handleClick}>
          <h2>Clickable Card</h2>
        </Card>
      );

      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
