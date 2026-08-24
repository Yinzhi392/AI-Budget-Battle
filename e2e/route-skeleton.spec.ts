import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "AI Budget Battle", showsSkeletonStatus: false },
  { path: "/battle/region-currency", heading: "选择战区和货币", showsSkeletonStatus: false },
  { path: "/battle/period", heading: "选择分析周期", showsSkeletonStatus: false },
  { path: "/battle/upload", heading: "上传账单或手动输入", showsSkeletonStatus: false },
  { path: "/battle/confirm", heading: "确认交易记录", showsSkeletonStatus: false },
  { path: "/battle/generating", heading: "准备生成战报", showsSkeletonStatus: false },
  { path: "/battle/result/demo-session", heading: "Cyber Wrapped 战报", showsSkeletonStatus: false },
  { path: "/battle/share/demo-report", heading: "分享卡片编辑器", showsSkeletonStatus: false },
  { path: "/auth", heading: "登录后继续保存", showsSkeletonStatus: false },
  { path: "/history", heading: "历史战报", showsSkeletonStatus: false },
  { path: "/dashboard", heading: "轻量数据面板", showsSkeletonStatus: false },
];

test.describe("Task 3 route skeleton", () => {
  for (const route of routes) {
    test(`${route.path} loads without crashing`, async ({ page }) => {
      if (route.path === "/battle/period") {
        await page.goto("/battle/start");
        await page.getByRole("button", { name: "继续选择周期" }).click();
      } else if (route.path === "/battle/upload") {
        await page.goto("/battle/start");
        await page.getByRole("button", { name: "继续选择周期" }).click();
        await page.getByRole("button", { name: "进入上传" }).click();
      } else if (route.path === "/battle/confirm" || route.path === "/battle/generating") {
        await page.goto("/battle/start");
        await page.getByRole("button", { name: "继续选择周期" }).click();
        await page.getByRole("button", { name: "进入上传" }).click();
        await page.getByLabel("金额", { exact: true }).fill("10");
        await page.locator('select[name="category"]').selectOption("milk_tea");
        await page.getByLabel("消费时间").fill("2026-05-21T12:00");
        await page.getByRole("button", { name: "添加交易" }).click();
        await page.getByRole("button", { name: "进入确认" }).click();
        if (route.path === "/battle/generating") {
          await page.getByRole("button", { name: "确认并生成战报" }).click();
        }
      } else {
        await page.goto(route.path);
      }

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      if (route.showsSkeletonStatus) {
        await expect(page.getByText("功能骨架")).toBeVisible();
      } else {
        await expect(page.getByText("功能骨架")).toBeHidden();
      }

      if (route.path === "/") {
        await expect(page.getByText("Developer: Yinzhi")).toBeVisible();
        await expect(
          page.getByText("不用整理完整账本，上传月度总结或几笔代表性消费，也能生成一份估算型消费人格战报。"),
        ).toBeHidden();
        await expect(page.getByText("MVP Route Map")).toBeHidden();
        await expect(page.getByText(/当前页面只承载 Task 3/)).toBeHidden();
        await expect(page.getByText("中文优先")).toBeHidden();
        await expect(page.getByText("匿名先体验")).toBeHidden();
        await expect(page.getByText("分享卡默认隐藏商户明细")).toBeVisible();
      }

      if (route.path === "/battle/generating") {
        await expect(
          page.getByText("赛博扫描动画和进度消息会在这里承接确认后的等待状态。"),
        ).toBeHidden();
        await expect(page.getByText("生成完成后会自动打开战报页。")).toBeVisible();
      }
    });
  }
});
