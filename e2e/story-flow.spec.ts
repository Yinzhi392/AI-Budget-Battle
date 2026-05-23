import { expect, test, type Page } from "@playwright/test";

async function generateReport(page: Page) {
  await page.goto("/battle/start");
  await page.getByRole("button", { name: "继续选择周期" }).click();
  await page.getByRole("button", { name: "进入上传" }).click();

  await page.getByLabel("金额", { exact: true }).fill("10");
  await page.locator('select[name="category"]').selectOption("milk_tea");
  await page.getByLabel("消费时间").fill("2026-05-21T12:00");
  await page.getByLabel("商户或备注").fill("一点点");
  await page.getByRole("button", { name: "添加交易" }).click();
  await page.getByRole("button", { name: "进入确认" }).click();
  await page.getByRole("button", { name: "确认并生成战报" }).click();
  await page.getByRole("button", { name: "开始生成战报" }).click();

  await expect(page).toHaveURL(/\/battle\/result\/analysis_\d+$/);
}

async function expectStoryNavigation(page: Page) {
  await expect(page.getByRole("heading", { name: "奶茶黑洞人格🧋" })).toBeVisible();
  await expect(page.getByRole("img", { name: "奶茶黑洞人格角色图" })).toBeVisible();
  await expect(page.getByText("01 / 08")).toBeVisible();
  await expect(page.getByText("人格揭晓")).toBeVisible();
  await expect(page.getByText("🎁 会奖励自己")).toBeVisible();
  await expect(page.getByText("🧭 生活节奏清晰")).toBeVisible();
  await expect(page.getByText("⚠️ 小额高频支出容易失控")).toBeVisible();
  await expect(page.getByText("一点点")).toBeHidden();

  await page.getByRole("button", { name: "下一屏" }).click();
  await expect(page.getByText("02 / 08")).toBeVisible();
  await expect(page.getByText("消费雷达")).toBeVisible();
  await expect(page.getByText("小额高频", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "上一屏" }).click();
  await expect(page.getByText("01 / 08")).toBeVisible();

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole("button", { name: "下一屏" }).click();
  }
  await expect(page.getByText("04 / 08")).toBeVisible();
  await expect(page.getByLabel("五维消费能力雷达图")).toBeVisible();
  await expect(page.locator('svg[aria-label="五维消费能力雷达图"] text')).toHaveCount(5);

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "下一屏" }).click();
  }

  await expect(page.getByText("08 / 08")).toBeVisible();
  await expect(page.getByText("分享预览")).toBeVisible();
  await expect(page.getByRole("link", { name: "编辑分享卡" })).toBeVisible();
}

test.describe("Task 10 Cyber Wrapped story flow", () => {
  test("mobile users can move forward and backward through the story", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await generateReport(page);
    await expectStoryNavigation(page);
  });

  test("desktop users can navigate the full story without raw merchant details", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await generateReport(page);
    await expectStoryNavigation(page);
  });
});
