import { expect, test, type Page } from "@playwright/test";

async function generateReportAndOpenShare(page: Page) {
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
  await page.getByRole("button", { name: "下一屏" }).click();
  await page.getByRole("button", { name: "下一屏" }).click();
  await page.getByRole("button", { name: "下一屏" }).click();
  await page.getByRole("button", { name: "下一屏" }).click();
  await page.getByRole("button", { name: "下一屏" }).click();
  await page.getByRole("button", { name: "下一屏" }).click();
  await page.getByRole("button", { name: "下一屏" }).click();
  await page.getByRole("link", { name: "编辑分享卡" }).click();
}

test.describe("Task 11 share card export", () => {
  test("previews all templates and gates the second anonymous export", async ({ page }) => {
    await generateReportAndOpenShare(page);

    await expect(page.getByRole("heading", { name: "分享卡片编辑器" })).toBeVisible();
    await expect(page.getByRole("button", { name: "小红书方图" })).toBeVisible();
    await expect(page.getByRole("button", { name: "小红书竖图" })).toBeVisible();
    await expect(page.getByRole("button", { name: "微信朋友圈" })).toBeVisible();
    await expect(page.getByText("AI Budget Battle 水印")).toBeVisible();
    await expect(page.getByText("一点点")).toBeHidden();

    await page.getByRole("button", { name: "导出水印分享卡" }).click();
    await expect(page.getByText("已生成水印分享卡")).toBeVisible();

    await page.getByRole("button", { name: "导出水印分享卡" }).click();
    await expect(page.getByText("登录后继续")).toBeVisible();
  });
});
