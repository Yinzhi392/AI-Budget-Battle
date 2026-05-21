import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "AI Budget Battle" },
  { path: "/battle/region-currency", heading: "选择战区和货币" },
  { path: "/battle/period", heading: "选择分析周期" },
  { path: "/battle/upload", heading: "上传账单或手动输入" },
  { path: "/battle/confirm", heading: "确认交易记录" },
  { path: "/battle/generating", heading: "正在生成战报" },
  { path: "/battle/result/demo-session", heading: "Cyber Wrapped 战报" },
  { path: "/battle/share/demo-report", heading: "分享卡片编辑器" },
  { path: "/auth", heading: "登录后继续保存" },
  { path: "/history", heading: "历史战报" },
  { path: "/dashboard", heading: "轻量数据面板" },
];

test.describe("Task 3 route skeleton", () => {
  for (const route of routes) {
    test(`${route.path} loads without crashing`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.getByText("功能骨架")).toBeVisible();
    });
  }
});
