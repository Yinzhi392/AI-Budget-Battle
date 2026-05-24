import { describe, expect, it } from "vitest";
import { buildShareCardViewModels } from "@/lib/share-card";
import { createMockPersistence } from "@/server/providers/mock-persistence";
import type { AiReport, AnalysisSession } from "@/types/domain";

const analysisSession: AnalysisSession = {
  id: "analysis_1",
  anonymousSessionId: "anonymous_1",
  region: "cn_mainland",
  currency: "CNY",
  periodStart: "2026-05-01T00:00:00.000Z",
  periodEnd: "2026-05-31T23:59:59.999Z",
  status: "report_generated",
  isSaved: false,
  createdAt: "2026-05-21T00:00:00.000Z",
};

const report: AiReport = {
  id: "report_1",
  analysisSessionId: analysisSession.id,
  personality: {
    title: "奶茶黑洞人格",
    emoji: "MT",
    description: "你不是在买奶茶，你是在给情绪续命。",
    strengths: ["会奖励自己"],
    weaknesses: ["小额高频支出容易失控"],
    behaviorSummary: "本期包含 1 笔确认交易。商户一点点只应留在内部明细。",
  },
  roast: {
    short: "你的奶茶预算已经开始像房租一样稳定了。",
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
    xiaohongshu: "AI 说我是奶茶黑洞人格，笑死但有点准。",
    wechat: "我的 AI 消费人格报告出来了。",
  },
  generatedAt: "2026-05-21T00:00:00.000Z",
};

describe("Task 11 share card templates", () => {
  it("builds three privacy-safe share card templates without raw merchant detail", () => {
    const cards = buildShareCardViewModels(report, {
      periodLabel: "本月",
      isWatermarked: true,
    });

    expect(cards.map((card) => card.templateType)).toEqual([
      "xiaohongshu_square",
      "xiaohongshu_vertical",
      "wechat_moments",
    ]);
    expect(cards.find((card) => card.templateType === "wechat_moments")?.aspectRatio).toBe("3 / 4");
    expect(cards.find((card) => card.templateType === "xiaohongshu_vertical")?.aspectRatio).toBe("3 / 4");
    expect(cards).toHaveLength(3);
    expect(JSON.stringify(cards)).not.toContain("一点点");
    expect(cards.every((card) => card.watermark.includes("AI Budget Battle"))).toBe(true);
    expect(cards.every((card) => card.personalityTitle === "奶茶黑洞人格🧋")).toBe(true);
    expect(cards.every((card) => card.personaImage?.src.includes("/personas/milk-tea-black-hole.png"))).toBe(true);
  });

  it("mock persistence finds snapshots by report id and enforces one anonymous export", async () => {
    const persistence = createMockPersistence({
      analysisSessions: [analysisSession],
      aiReports: [report],
    });

    const snapshot = await persistence.getAnalysisSnapshotByReportId("report_1");
    expect(snapshot?.report?.id).toBe("report_1");

    await persistence.saveShareCard({
      aiReportId: "report_1",
      templateType: "xiaohongshu_square",
      platform: "xiaohongshu",
      imageUrl: "data:image/png;base64,first",
      challengeTag: "#本周奶茶战损",
      isWatermarked: true,
      ownerType: "anonymous",
    });

    await expect(
      persistence.saveShareCard({
        aiReportId: "report_1",
        templateType: "wechat_moments",
        platform: "wechat",
        imageUrl: "data:image/png;base64,second",
        challengeTag: "#本周奶茶战损",
        isWatermarked: true,
        ownerType: "anonymous",
      }),
    ).rejects.toThrow(/one anonymous share card/i);
  });
});
