import { expect, test } from "@playwright/test";

test.describe("Task 5 setup flow", () => {
  test("anonymous setup persists through refresh", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /开始战斗/ }).click();

    await expect(page).toHaveURL(/\/battle\/region-currency$/);
    await expect(page.getByRole("heading", { name: "选择战区和货币" })).toBeVisible();
    await expect(page.getByLabel("中国大陆学生 / CNY")).toBeChecked();

    await page.getByRole("button", { name: "继续选择周期" }).click();
    await expect(page).toHaveURL(/\/battle\/period$/);
    await expect(page.getByRole("heading", { name: "选择分析周期" })).toBeVisible();
    await expect(page.getByLabel("本月")).toBeChecked();

    await page.getByRole("button", { name: "进入上传" }).click();
    await expect(page).toHaveURL(/\/battle\/upload$/);
    await expect(page.getByRole("heading", { name: "上传账单或手动输入" })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/battle\/upload$/);
    await expect(page.getByText("中国大陆学生 / CNY")).toBeVisible();
    await expect(page.getByText("本月")).toBeVisible();
    await expect(page.getByText("this_month")).toBeHidden();
  });

  test("upload redirects to the earliest missing setup step", async ({ page }) => {
    await page.goto("/battle/upload");

    await expect(page).toHaveURL(/\/battle\/region-currency$/);
    await expect(page.getByRole("heading", { name: "选择战区和货币" })).toBeVisible();
  });

  test("region and currency card styling follows the selected option", async ({ page }) => {
    await page.goto("/battle/start");

    const mainland = page.getByTestId("region-option-cn-mainland");
    const studyAbroad = page.getByTestId("region-option-study-abroad");

    const selectedBorder = await mainland.evaluate((element) => getComputedStyle(element).borderTopColor);
    const unselectedBorder = await studyAbroad.evaluate((element) => getComputedStyle(element).borderTopColor);
    expect(selectedBorder).not.toBe(unselectedBorder);

    await page.getByLabel("留学生").check();

    await expect
      .poll(() => studyAbroad.evaluate((element) => getComputedStyle(element).borderTopColor))
      .not.toBe(unselectedBorder);
    await expect
      .poll(() => mainland.evaluate((element) => getComputedStyle(element).borderTopColor))
      .toBe(unselectedBorder);
  });

  test("study abroad setup uses country or region and currency selectors", async ({ page }) => {
    await page.goto("/battle/start");

    await expect(page.getByText("海外中文学生")).toBeHidden();
    await expect(page.getByText("国际学生 / USD")).toBeHidden();

    await page.getByLabel("留学生").check();
    await expect(page.getByLabel("留学国家或地区")).toBeVisible();
    await expect(page.getByLabel("留学地区货币")).toBeVisible();

    await page.getByLabel("留学国家或地区").selectOption("MY");
    await page.getByLabel("留学地区货币").selectOption("MYR");
    await page.getByRole("button", { name: "继续选择周期" }).click();
    await page.getByRole("button", { name: "进入上传" }).click();

    await expect(page).toHaveURL(/\/battle\/upload$/);
    await expect(page.getByText("留学生 / MYR")).toBeVisible();
    await expect(page.getByText("马来西亚")).toBeVisible();
  });

  test("mobile study abroad setup keeps country and currency selectors usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/battle/start");

    await expect(page.getByLabel("留学国家或地区")).toBeVisible();
    await expect(page.getByLabel("留学地区货币")).toBeVisible();
    await page.getByLabel("留学生").check();
    await expect(page.getByLabel("留学国家或地区")).toBeVisible();
    await expect(page.getByLabel("留学地区货币")).toBeVisible();
    await expect(page.locator("label").filter({ has: page.getByLabel("留学国家或地区") })).toHaveCount(0);
    await expect(page.locator("label").filter({ has: page.getByLabel("留学地区货币") })).toHaveCount(0);

    await page.getByLabel("留学国家或地区").selectOption("US");
    await page.getByLabel("留学地区货币").selectOption("USD");
    await page.getByRole("button", { name: "继续选择周期" }).click();
    await expect(page).toHaveURL(/\/battle\/period$/);
  });

  test("region and currency page hides developer skeleton hints", async ({ page }) => {
    await page.goto("/battle/start");

    await expect(page.getByText("分类预览待接入")).toBeHidden();
    await expect(page.getByText("MVP Route Map")).toBeHidden();
    await expect(page.getByText("当前页面只承载 Task 3")).toBeHidden();
    await expect(page.getByText("功能骨架")).toBeHidden();
  });

  test("period access without region and currency redirects back", async ({ page }) => {
    await page.goto("/battle/period");

    await expect(page).toHaveURL(/\/battle\/region-currency$/);
    await expect(page.getByRole("heading", { name: "选择战区和货币" })).toBeVisible();
  });
});
