import { expect, test, type Page } from "@playwright/test";

async function completeSetup(page: Page) {
  await page.goto("/battle/start");
  await page.getByRole("button", { name: "继续选择周期" }).click();
  await page.getByRole("button", { name: "进入上传" }).click();
  await expect(page).toHaveURL(/\/battle\/upload$/);
}

test.describe("Task 6 upload flow", () => {
  test("quick monthly-summary screenshot can proceed without daily screenshots", async ({ page }) => {
    await completeSetup(page);

    await expect(page.getByText("估算型娱乐分析")).toBeVisible();
    await page.getByLabel("月度分析截图").check();
    await page.getByLabel("账单截图").setInputFiles({
      name: "alipay-monthly.png",
      mimeType: "image/png",
      buffer: Buffer.from("mock image"),
    });

    await expect(page.getByText("已选择 1 张截图")).toBeVisible();
    await page.getByRole("button", { name: "进入确认" }).click();
    await expect(page).toHaveURL(/\/battle\/confirm$/);
  });

  test("manual-only fallback accepts a valid transaction", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("金额", { exact: true }).fill("10");
    await page.locator('select[name="category"]').selectOption("milk_tea");
    await page.getByLabel("消费时间").fill("2026-05-21T12:00");
    await page.getByLabel("商户或备注").fill("一点点");
    await page.getByRole("button", { name: "添加交易" }).click();

    await expect(page.getByText("一点点")).toBeVisible();
    await page.getByRole("button", { name: "进入确认" }).click();
    await expect(page).toHaveURL(/\/battle\/confirm$/);
  });

  test("invalid manual entries show a clear error", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("金额", { exact: true }).fill("0");
    await page.getByRole("button", { name: "添加交易" }).click();

    await expect(page.getByText("请输入大于 0 的金额")).toBeVisible();
  });

  test("category totals can be used as estimated fallback with screenshots", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("账单截图").setInputFiles({
      name: "wechat-day.png",
      mimeType: "image/png",
      buffer: Buffer.from("mock image"),
    });
    await page.getByLabel("分类总额").selectOption("food_delivery");
    await page.getByLabel("分类金额").fill("188");
    await page.getByLabel("说明").fill("微信本月外卖大概金额");
    await page.getByRole("button", { name: "添加分类总额" }).click();

    await expect(page.getByText("外卖 / 188 CNY")).toBeVisible();
    await expect(page.getByText("微信本月外卖大概金额")).toBeVisible();
    await page.getByRole("button", { name: "进入确认" }).click();
    await expect(page).toHaveURL(/\/battle\/confirm$/);
  });

  test("manual input can continue when screenshot extraction fails", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("账单截图").setInputFiles({
      name: "force-extraction-failure.png",
      mimeType: "image/png",
      buffer: Buffer.from("mock image"),
    });
    await page.getByLabel("金额", { exact: true }).fill("10");
    await page.locator('select[name="category"]').selectOption("milk_tea");
    await page.getByLabel("消费时间").fill("2026-05-21T12:00");
    await page.getByLabel("商户或备注").fill("一点点");
    await page.getByRole("button", { name: "添加交易" }).click();

    await page.getByRole("button", { name: "进入确认" }).click();
    await expect(page).toHaveURL(/\/battle\/confirm$/);
  });
});
