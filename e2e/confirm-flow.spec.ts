import { expect, test, type Page } from "@playwright/test";

async function completeSetup(page: Page) {
  await page.goto("/battle/start");
  await page.getByRole("button", { name: "继续选择周期" }).click();
  await page.getByRole("button", { name: "进入上传" }).click();
  await expect(page).toHaveURL(/\/battle\/upload$/);
}

test.describe("Task 8 confirmation flow", () => {
  test("corrects a low-confidence extracted row and confirms valid data", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("代表性日账单").check();
    await page.getByLabel("账单截图").setInputFiles({
      name: "wechat-day.png",
      mimeType: "image/png",
      buffer: Buffer.from("mock image"),
    });
    await page.getByRole("button", { name: "进入确认" }).click();
    await expect(page).toHaveURL(/\/battle\/confirm$/);

    await expect(page.getByRole("heading", { name: "确认交易记录" })).toBeVisible();
    await expect(page.getByText("置信度偏低")).toBeVisible();

    await page.getByLabel("交易金额").first().fill("10");
    await page.getByLabel("交易分类").first().selectOption("milk_tea");
    await page.getByLabel("商户或备注").first().fill("一点点");

    await page.getByRole("button", { name: "确认并生成战报" }).click();
    await expect(page).toHaveURL(/\/battle\/generating$/);
  });

  test("can delete extracted rows, add an estimated aggregate, and confirm", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("月度分析截图").check();
    await page.getByLabel("账单截图").setInputFiles({
      name: "alipay-monthly.png",
      mimeType: "image/png",
      buffer: Buffer.from("mock image"),
    });
    await page.getByRole("button", { name: "进入确认" }).click();

    await expect(page.getByText("估算数据")).toBeVisible();
    await page.getByRole("button", { name: "删除此行" }).first().click();
    await expect(page.getByText("还没有已接受的数据")).toBeVisible();

    await page.getByRole("button", { name: "添加估算汇总" }).click();
    await page.getByLabel("汇总金额").last().fill("188");
    await page.getByLabel("汇总分类").last().selectOption("food_delivery");
    await page.getByLabel("估算周期").last().fill("本月");

    await page.getByRole("button", { name: "确认并生成战报" }).click();
    await expect(page).toHaveURL(/\/battle\/generating$/);
  });
});
