import { expect, test, type Page } from "@playwright/test";

async function completeSetup(page: Page) {
  await page.goto("/battle/start");
  await page.getByRole("button", { name: "继续选择周期" }).click();
  await page.getByRole("button", { name: "进入上传" }).click();
  await expect(page).toHaveURL(/\/battle\/upload$/);
}

async function generateReportAndOpenResult(page: Page) {
  await page.getByRole("button", { name: "开始生成战报" }).click();

  try {
    await page.waitForURL(/\/battle\/result\/analysis_\d+$/, { timeout: 5000 });
    return;
  } catch {
    const loginLink = page.getByRole("link", { name: "登录后继续" });
    if (!(await loginLink.isVisible())) {
      throw new Error("Report did not generate and no login continuation was shown.");
    }

    await loginLink.click();
    await page.getByLabel("邮箱").fill("persona-regression@example.com");
    await page.getByRole("button", { name: "发送 Magic Link 并登录" }).click();
    await expect(page).toHaveURL(/\/battle\/generating$/);
    await page.getByRole("button", { name: "开始生成战报" }).click();
    await page.waitForURL(/\/battle\/result\/analysis_\d+$/);
  }
}

test.describe("Task 9 report generation boundary", () => {
  test("confirmed rows can generate a safe mock report and continue to result", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("金额", { exact: true }).fill("10");
    await page.locator('select[name="category"]').selectOption("milk_tea");
    await page.getByLabel("消费时间").fill("2026-05-21T12:00");
    await page.getByLabel("商户或备注").fill("一点点");
    await page.getByRole("button", { name: "添加交易" }).click();
    await page.getByRole("button", { name: "进入确认" }).click();
    await page.getByRole("button", { name: "确认并生成战报" }).click();

    await expect(page).toHaveURL(/\/battle\/generating$/);
    await expect(page.getByRole("heading", { name: "准备生成战报" })).toBeVisible();
    const scanPanel = page.getByTestId("scan-copy");
    await expect(scanPanel.getByText("战报已准备好")).toBeVisible();
    await expect(scanPanel.getByText("完成后会自动打开战报页")).toBeVisible();
    await expect(page.getByText("生成中，请稍等")).toBeHidden();
    await expect(page.getByText("整理确认记录", { exact: true })).toBeHidden();
    await expect(page.getByText("生成消费人格", { exact: true })).toBeHidden();
    await expect(page.getByText("准备分享内容", { exact: true })).toBeHidden();
    await expect(page.getByText("结构校验", { exact: true })).toBeHidden();
    await expect(page.getByText("毒舌安全阀", { exact: true })).toBeHidden();
    await expect(page.getByText("基准文案过滤", { exact: true })).toBeHidden();
    await expect(page.getByText("吐槽安全检查")).toBeHidden();
    await expect(page.getByText("基准文案检查")).toBeHidden();
    await expect(page.getByText("Cyber Scan")).toBeVisible();
    await expect(page.getByText("正在扫描你的消费人格")).toBeHidden();
    await expect(page.getByTestId("loop-scan-animation")).toBeVisible();
    await expect(scanPanel.getByText("AI", { exact: true })).toBeHidden();
    const scanSection = page.locator(
      'section[aria-label="生成战报扫描进度"]',
    );
    const sectionBox = await scanSection.boundingBox();
    const panelBox = await scanPanel.boundingBox();
    expect(sectionBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    expect(sectionBox?.height).toBeGreaterThanOrEqual(420);
    const sectionCenter = sectionBox!.y + sectionBox!.height / 2;
    const panelCenter = panelBox!.y + panelBox!.height / 2;
    expect(Math.abs(panelCenter - sectionCenter)).toBeLessThan(48);
    await generateReportAndOpenResult(page);
    await expect(page).toHaveURL(/\/battle\/result\/analysis_\d+$/);
  });

  test("manual category selection changes the generated spending persona", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("金额", { exact: true }).fill("120");
    await page.locator('select[name="category"]').selectOption("gaming");
    await page.getByLabel("消费时间").fill("2026-05-21T12:00");
    await page.getByLabel("商户或备注").fill("Steam");
    await page.getByRole("button", { name: "添加交易" }).click();
    await page.getByRole("button", { name: "进入确认" }).click();
    await page.getByRole("button", { name: "确认并生成战报" }).click();
    await generateReportAndOpenResult(page);

    await expect(page).toHaveURL(/\/battle\/result\/analysis_\d+$/);
    await expect(page.getByRole("heading", { name: "游戏氪金战神人格🎮" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "奶茶黑洞人格🧋" })).toBeHidden();
  });

  test("changing confirmed input after a generated report invalidates the stale persona", async ({ page }) => {
    await completeSetup(page);

    await page.getByLabel("金额", { exact: true }).fill("10");
    await page.locator('select[name="category"]').selectOption("milk_tea");
    await page.getByLabel("消费时间").fill("2026-05-21T12:00");
    await page.getByLabel("商户或备注").fill("一点点");
    await page.getByRole("button", { name: "添加交易" }).click();
    await page.getByRole("button", { name: "进入确认" }).click();
    await page.getByRole("button", { name: "确认并生成战报" }).click();
    await generateReportAndOpenResult(page);
    await expect(page.getByRole("heading", { name: "奶茶黑洞人格🧋" })).toBeVisible();

    await page.goto("/battle/upload");
    await page.getByLabel("金额", { exact: true }).fill("120");
    await page.locator('select[name="category"]').selectOption("transport");
    await page.getByLabel("消费时间").fill("2026-05-22T12:00");
    await page.getByLabel("商户或备注").fill("地铁和打车");
    await page.getByRole("button", { name: "添加交易" }).click();
    await page.getByRole("button", { name: "进入确认" }).click();
    await page.getByRole("button", { name: "确认并生成战报" }).click();
    await generateReportAndOpenResult(page);

    await expect(page.getByRole("heading", { name: "出门即打车人格🚕" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "奶茶黑洞人格🧋" })).toBeHidden();
  });
});
