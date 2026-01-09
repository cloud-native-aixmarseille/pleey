import { describe, expect, it } from "vitest";

import { PATIENCE_ANIMATIONS } from "./registry";

describe("patience registry", () => {
  it("exposes the lemmings animation", () => {
    expect(PATIENCE_ANIMATIONS.lemmings).toBeTypeOf("function");
  });
});
