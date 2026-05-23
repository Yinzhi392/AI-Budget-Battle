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

  for (let i = 0; i < 7; i += 1) {
    await page.getByRole("button", { name: "下一屏" }).click();
  }
  await page.getByRole("link", { name: "编辑分享卡" }).click();
}

test.describe("Task 13 history and dashboard", () => {
  test("logged-in users can view, reopen, inspect, and delete saved reports", async ({ page }) => {
    const email = `history13-${Date.now()}@qq.com`;

    await generateReportAndOpenShare(page);
    await page.getByRole("button", { name: "导出水印分享卡" }).click();
    await expect(page.getByText("已生成水印分享卡")).toBeVisible();
    await page.getByRole("button", { name: "保存历史 / 去水印" }).click();
    await page.getByRole("link", { name: "去登录继续" }).click();
    await page.getByLabel("邮箱").fill(email);
    await page.getByRole("button", { name: "发送 Magic Link 并登录" }).click();
    await expect(page.getByText(`已登录 ${email}`)).toBeVisible();
    await page.getByRole("button", { name: "保存历史 / 去水印" }).click();
    await expect(page.getByText("已保存到登录账户")).toBeVisible();

    await page.goto("/history");
    await expect(page.getByRole("heading", { name: "历史战报" })).toBeVisible();
    await expect(page.getByText("奶茶黑洞人格").first()).toBeVisible();

    await page.getByRole("link", { name: "查看轻量面板" }).first().click();
    await expect(page.getByRole("heading", { name: "轻量数据面板" })).toBeVisible();
    await expect(page.getByText("分类拆解")).toBeVisible();
    await expect(page.getByText("确认输入")).toBeVisible();
    await expect(page.getByText("截图保留状态")).toBeVisible();
    await expect(page.getByText("原始截图只作为临时分析资产")).toBeVisible();
    await expect(page.getByText("mock://temporary")).toBeHidden();

    await page.goto("/history");
    await page.getByRole("link", { name: "打开战报" }).first().click();
    await expect(page.getByRole("heading", { name: "Cyber Wrapped 战报" })).toBeVisible();

    await page.goto("/history");
    await page.getByRole("button", { name: "删除战报" }).first().click();
    await expect(page.getByText("已删除战报")).toBeVisible();
    await expect(page.getByText("还没有保存的战报")).toBeVisible();
  });
});
