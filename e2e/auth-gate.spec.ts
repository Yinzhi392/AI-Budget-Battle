import { expect, test, type Page } from "@playwright/test";

async function addManualMilkTeaAndGenerate(page: Page) {
  await page.getByLabel("金额", { exact: true }).fill("10");
  await page.locator('select[name="category"]').selectOption("milk_tea");
  await page.getByLabel("消费时间").fill("2026-05-21T12:00");
  await page.getByLabel("商户或备注").fill("一点点");
  await page.getByRole("button", { name: "添加交易" }).click();
  await page.getByRole("button", { name: "进入确认" }).click();
  await page.getByRole("button", { name: "确认并生成战报" }).click();
  await page.getByRole("button", { name: "开始生成战报" }).click();
}

async function generateReportAndOpenShare(page: Page) {
  await page.goto("/battle/start");
  await page.getByRole("button", { name: "继续选择周期" }).click();
  await page.getByRole("button", { name: "进入上传" }).click();
  await addManualMilkTeaAndGenerate(page);

  for (let i = 0; i < 7; i += 1) {
    await page.getByRole("button", { name: "下一屏" }).click();
  }
  await page.getByRole("link", { name: "编辑分享卡" }).click();
}

test.describe("Task 12 auth gate", () => {
  test("logs in from a restricted share action and continues on the share page", async ({ page }) => {
    await generateReportAndOpenShare(page);

    await page.getByRole("button", { name: "导出水印分享卡" }).click();
    await expect(page.getByText("已生成水印分享卡")).toBeVisible();

    await page.getByRole("button", { name: "保存历史 / 去水印" }).click();
    await expect(page.getByText("登录后继续")).toBeVisible();
    await page.getByRole("link", { name: "去登录继续" }).click();

    await expect(page.getByRole("heading", { name: "登录后继续保存" })).toBeVisible();
    await page.getByLabel("邮箱").fill("student@qq.com");
    await page.getByRole("button", { name: "发送 Magic Link 并登录" }).click();

    await expect(page.getByRole("heading", { name: "分享卡片编辑器" })).toBeVisible();
    await expect(page.getByText("已登录 student@qq.com")).toBeVisible();

    await page.getByRole("button", { name: "保存历史 / 去水印" }).click();
    await expect(page.getByText("已保存到登录账户")).toBeVisible();
  });

  test("requires login before an anonymous user generates a second report", async ({ page }) => {
    await page.goto("/battle/start");
    await page.getByRole("button", { name: "继续选择周期" }).click();
    await page.getByRole("button", { name: "进入上传" }).click();
    await addManualMilkTeaAndGenerate(page);

    await page.goto("/battle/period");
    await page.getByRole("button", { name: "进入上传" }).click();
    await addManualMilkTeaAndGenerate(page);

    await expect(page.getByText("登录后继续：匿名用户只能生成一份战报")).toBeVisible();
    await expect(page.getByRole("link", { name: "登录后继续" })).toBeVisible();
  });
});
