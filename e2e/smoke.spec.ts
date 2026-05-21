import { expect, test } from "@playwright/test";

test("root page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/AI Budget Battle/);
  await expect(page.getByRole("heading", { name: /AI Budget Battle/i })).toBeVisible();
});
