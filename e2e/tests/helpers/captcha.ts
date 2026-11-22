import { expect, type Page } from "@playwright/test";

export async function completeSecurityCheck(page: Page): Promise<string> {
  const widget = page.locator("cap-widget");
  await widget.getByRole("button", { name: "Complete the security check", exact: true }).click();
  await expect
    .poll(() =>
      widget.evaluate((element) => (element as HTMLElement & { tokenValue: string | null }).tokenValue),
    )
    .not.toBeNull();
  // Cap may redeem speculatively before activation; use its public solved-token property.
  const token = await widget.evaluate((element) => (element as HTMLElement & { tokenValue: string | null }).tokenValue);

  if (!token) {
    throw new Error("Security check completed without a verification token.");
  }

  return token;
}
