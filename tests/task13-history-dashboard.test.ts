import { describe, expect, it } from "vitest";
import { buildDashboardSummary } from "@/lib/dashboard-summary";
import { evaluateScreenshotRetention } from "@/server/storage/retention";
import { createMockPersistence } from "@/server/providers/mock-persistence";
import type {
  AiReport,
  AnalysisSession,
  AnalysisSnapshot,
  ConfirmedAggregateItem,
  TransactionItem,
  UploadedImageMetadata,
} from "@/types/domain";

const savedSession: AnalysisSession = {
  id: "analysis_1",
  userId: "user_owner",
  anonymousSessionId: "anonymous_1",
  region: "cn_mainland",
  currency: "CNY",
  periodStart: "2026-05-01T00:00:00.000Z",
  periodEnd: "2026-05-31T23:59:59.999Z",
  status: "saved",
  isSaved: true,
  createdAt: "2026-05-21T00:00:00.000Z",
};

const otherSession: AnalysisSession = {
  ...savedSession,
  id: "analysis_2",
  userId: "user_other",
};

const report: AiReport = {
  id: "report_1",
  analysisSessionId: savedSession.id,
  personality: {
    title: "奶茶黑洞人格",
    emoji: "MT",
    description: "你不是在买奶茶，你是在给情绪续命。",
    strengths: ["会奖励自己"],
    weaknesses: ["小额高频支出容易失控"],
    behaviorSummary: "奶茶和外卖是本期主要支出。",
  },
  roast: {
    short: "奶茶不是你的搭子，是你的赛博房东。",
    safeLevel: "sharp_safe",
  },
  scores: {
    financialHealth: 68,
    impulse: 82,
    savingsPotential: 61,
    lifestyleEfficiency: 54,
    stability: 72,
  },
  benchmarkInsights: [
    {
      category: "milk_tea",
      text: "你的奶茶支出接近学生高频消费组。",
      confidence: "benchmark",
    },
  ],
  riskPredictions: [
    {
      type: "overspending",
      text: "如果保持这个节奏，月底娱乐预算会提前透支。",
      severity: "medium",
    },
  ],
  challenge: {
    title: "奶茶战损挑战",
    tag: "#本周奶茶战损",
    description: "晒出你的本周奶茶人格。",
  },
  shareCopy: {
    xiaohongshu: "AI 说我是奶茶黑洞人格。",
    wechat: "我的 AI 消费人格报告出来了。",
  },
  generatedAt: "2026-05-21T00:00:00.000Z",
};

const transaction: TransactionItem = {
  id: "tx_1",
  analysisSessionId: savedSession.id,
  amount: 10,
  currency: "CNY",
  category: "milk_tea",
  merchant: "一点点",
  transactionTime: "2026-05-21T12:00:00.000Z",
  source: "manual",
  confidence: 1,
  isUserConfirmed: true,
  createdAt: "2026-05-21T00:00:00.000Z",
};

const aggregate: ConfirmedAggregateItem = {
  id: "agg_1",
  analysisSessionId: savedSession.id,
  amount: 60,
  currency: "CNY",
  category: "food_delivery",
  periodLabel: "本月",
  source: "mock_ai",
  confidence: 0.72,
  isEstimate: true,
  isUserConfirmed: true,
  createdAt: "2026-05-21T00:00:00.000Z",
};

const screenshot: UploadedImageMetadata = {
  id: "image_1",
  analysisSessionId: savedSession.id,
  sourceType: "monthly_summary",
  originalName: "alipay-month.png",
  sizeBytes: 120_000,
  temporaryStorageUrl: "mock://temporary/alipay-month.png",
  ocrStatus: "completed",
  expiresAt: "2026-05-22T00:00:00.000Z",
  createdAt: "2026-05-21T00:00:00.000Z",
};

describe("Task 13 dashboard and history behavior", () => {
  it("builds a lightweight dashboard summary without raw merchant details", () => {
    const snapshot: AnalysisSnapshot = {
      analysisSession: savedSession,
      uploadedImages: [screenshot],
      confirmedTransactions: [transaction],
      confirmedAggregates: [aggregate],
      categoryTotalHints: [],
      report,
      shareCards: [],
    };

    const summary = buildDashboardSummary(snapshot, {
      now: "2026-05-21T12:00:00.000Z",
    });

    expect(summary.totalAmount).toBe(70);
    expect(summary.exactTotal).toBe(10);
    expect(summary.estimatedTotal).toBe(60);
    expect(summary.categoryBreakdown.map((item) => [item.category, item.amount])).toEqual([
      ["food_delivery", 60],
      ["milk_tea", 10],
    ]);
    expect(summary.transactionSummary).toContain("1 笔确认交易");
    expect(JSON.stringify(summary)).not.toContain("一点点");
    expect(summary.retentionItems[0]).toMatchObject({
      originalName: "alipay-month.png",
      status: "deletable_after_analysis",
      retainedAsHistory: false,
    });
  });

  it("marks screenshots expired after the 24-hour maximum retention window", () => {
    expect(
      evaluateScreenshotRetention(screenshot, {
        now: "2026-05-21T12:00:00.000Z",
        analysisCompleted: true,
      }),
    ).toMatchObject({
      status: "deletable_after_analysis",
      retainedAsHistory: false,
    });

    expect(
      evaluateScreenshotRetention(screenshot, {
        now: "2026-05-22T00:00:01.000Z",
        analysisCompleted: true,
      }),
    ).toMatchObject({
      status: "expired",
      retainedAsHistory: false,
    });
  });

  it("lists and deletes only the logged-in user's saved reports", async () => {
    const persistence = createMockPersistence({
      analysisSessions: [savedSession, otherSession],
      aiReports: [
        report,
        {
          ...report,
          id: "report_2",
          analysisSessionId: otherSession.id,
        },
      ],
    });

    await expect(persistence.listSavedReportsForUser("user_owner")).resolves.toHaveLength(1);
    await expect(persistence.deleteReportForUser("report_2", "user_owner")).resolves.toMatchObject({
      ok: false,
      reason: "forbidden",
    });
    await expect(persistence.deleteReportForUser("report_1", "user_owner")).resolves.toMatchObject({
      ok: true,
    });
    await expect(persistence.listSavedReportsForUser("user_owner")).resolves.toHaveLength(0);
  });
});
