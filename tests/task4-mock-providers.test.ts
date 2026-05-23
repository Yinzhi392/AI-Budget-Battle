import { describe, expect, test } from "vitest";
import { aiReportSchema, extractionOutputSchema, transactionCandidateListSchema } from "@/server/ai/schemas";
import { createMockAiProvider } from "@/server/providers/mock-ai";
import { createMockPersistence } from "@/server/providers/mock-persistence";

describe("Task 4 AI schemas", () => {
  test("accepts valid transaction candidates and rejects invalid candidates", () => {
    const valid = transactionCandidateListSchema.parse([
      {
        amount: 18.5,
        currency: "CNY",
        category: "milk_tea",
        merchant: "校园奶茶店",
        note: "下午茶",
        transactionTime: "2026-05-21T08:30:00.000Z",
        sourceImageId: "image_1",
        confidence: 0.86,
      },
    ]);

    expect(valid).toHaveLength(1);
    expect(valid[0]?.category).toBe("milk_tea");

    expect(() =>
      transactionCandidateListSchema.parse([
        {
          amount: -1,
          currency: "CNY",
          category: "invalid_category",
          transactionTime: "not-a-date",
          confidence: 1.5,
        },
      ]),
    ).toThrow();
  });

  test("accepts complete AI reports and rejects unsafe shapes", () => {
    const report = aiReportSchema.parse({
      personality: {
        title: "奶茶黑洞人格",
        emoji: "MT",
        description: "你不是在买奶茶，你是在给情绪续命。",
        strengths: ["会奖励自己", "生活仪式感强"],
        weaknesses: ["小额高频支出容易失控"],
        behaviorSummary: "本期饮品和外卖支出明显偏高。",
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
          text: "如果保持这个节奏，月底娱乐和外卖预算会提前透支。",
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
    });

    expect(report.scores.financialHealth).toBe(68);
    expect(report.benchmarkInsights[0]?.confidence).toBe("benchmark");

    expect(() =>
      aiReportSchema.parse({
        ...report,
        scores: { ...report.scores, impulse: 101 },
      }),
    ).toThrow();
  });
});

describe("Task 4 mock providers", () => {
  test("mock AI extraction returns validated transaction candidates from uploaded image metadata", async () => {
    const ai = createMockAiProvider();

    const candidates = await ai.extractTransactions({
      analysisSessionId: "analysis_1",
      uploadedImages: [
        {
          id: "image_1",
          analysisSessionId: "analysis_1",
          sourceType: "single_transaction",
          originalName: "alipay.png",
          sizeBytes: 42000,
          temporaryStorageUrl: "mock://temporary-uploads/alipay.png",
          ocrStatus: "pending",
          expiresAt: "2026-05-22T00:00:00.000Z",
          createdAt: "2026-05-21T00:00:00.000Z",
        },
      ],
    });

    const output = extractionOutputSchema.parse(candidates);
    expect(output.transactionCandidates).toHaveLength(1);
    expect(output.transactionCandidates.every((candidate) => candidate.sourceImageId === "image_1")).toBe(true);
  });

  test("mock AI report provider returns schema-valid Cyber Wrapped output", async () => {
    const ai = createMockAiProvider();

    const report = await ai.generateReport({
      analysisSessionId: "analysis_1",
      region: "cn_mainland",
      currency: "CNY",
      periodStart: "2026-05-01T00:00:00.000Z",
      periodEnd: "2026-05-21T00:00:00.000Z",
      confirmedTransactions: [
        {
          id: "transaction_1",
          analysisSessionId: "analysis_1",
          amount: 19.9,
          currency: "CNY",
          category: "milk_tea",
          merchant: "校园奶茶店",
          note: "下午茶",
          transactionTime: "2026-05-20T09:00:00.000Z",
          source: "manual",
          confidence: 1,
          isUserConfirmed: true,
          createdAt: "2026-05-21T00:00:00.000Z",
        },
      ],
      confirmedAggregates: [],
    });

    const parsedReport = aiReportSchema.parse(report);
    expect(parsedReport.personality.title).toContain("人格");
    expect(parsedReport.benchmarkInsights[0]?.text).not.toMatch(/排名|percentile/i);
  });

  test("mock persistence stores the local flow from session creation to report and one anonymous share card", async () => {
    const persistence = createMockPersistence();

    const anonymousSession = await persistence.createAnonymousSession({
      expiresAt: "2026-05-22T00:00:00.000Z",
    });
    const analysisSession = await persistence.createAnalysisSession({
      anonymousSessionId: anonymousSession.id,
      region: "cn_mainland",
      currency: "CNY",
      periodStart: "2026-05-01T00:00:00.000Z",
      periodEnd: "2026-05-21T00:00:00.000Z",
    });
    await persistence.saveUploadedImages(analysisSession.id, [
      {
        id: "image_1",
        analysisSessionId: analysisSession.id,
        sourceType: "monthly_summary",
        originalName: "alipay.png",
        sizeBytes: 42000,
        temporaryStorageUrl: "mock://temporary-uploads/alipay.png",
        ocrStatus: "pending",
        expiresAt: "2026-05-22T00:00:00.000Z",
        createdAt: "2026-05-21T00:00:00.000Z",
      },
    ]);
    await persistence.saveConfirmedTransactions(analysisSession.id, [
      {
        amount: 26,
        currency: "CNY",
        category: "food_delivery",
        merchant: "外卖平台",
        note: "夜宵",
        transactionTime: "2026-05-20T12:00:00.000Z",
        source: "manual",
        confidence: 1,
      },
    ]);

    const storedReport = await persistence.saveReport(analysisSession.id, {
      personality: {
        title: "外卖续命人格",
        emoji: "WM",
        description: "你的餐桌半径由骑手决定。",
        strengths: ["效率高"],
        weaknesses: ["外卖频率偏高"],
        behaviorSummary: "本期外卖支出偏高。",
      },
      roast: { short: "你的厨房像是只负责收快递。", safeLevel: "sharp_safe" },
      scores: {
        financialHealth: 70,
        impulse: 74,
        savingsPotential: 64,
        lifestyleEfficiency: 58,
        stability: 68,
      },
      benchmarkInsights: [
        { category: "food_delivery", text: "你的外卖支出高于学生基准线。", confidence: "benchmark" },
      ],
      riskPredictions: [
        { type: "overspending", text: "保持这个节奏可能压缩月底娱乐预算。", severity: "medium" },
      ],
      challenge: { title: "外卖冷却挑战", tag: "#本周少点一次", description: "本周少点一次外卖。" },
      shareCopy: { xiaohongshu: "AI 说我是外卖续命人格。", wechat: "我的 AI 消费人格报告出来了。" },
    });

    const firstCard = await persistence.saveShareCard({
      aiReportId: storedReport.id,
      templateType: "xiaohongshu_square",
      platform: "xiaohongshu",
      imageUrl: "mock://share-cards/card-1.png",
      challengeTag: "#本周少点一次",
      isWatermarked: true,
      ownerType: "anonymous",
    });

    await expect(
      persistence.saveShareCard({
        aiReportId: storedReport.id,
        templateType: "wechat_moments",
        platform: "wechat",
        imageUrl: "mock://share-cards/card-2.png",
        challengeTag: "#本周少点一次",
        isWatermarked: true,
        ownerType: "anonymous",
      }),
    ).rejects.toThrow(/one anonymous share card/i);

    const snapshot = await persistence.getAnalysisSnapshot(analysisSession.id);
    expect(firstCard.isWatermarked).toBe(true);
    expect(snapshot?.confirmedTransactions).toHaveLength(1);
    expect(snapshot?.report?.id).toBe(storedReport.id);
    expect(snapshot?.shareCards).toHaveLength(1);
  });

  test("mock persistence invalidates stale reports when confirmed inputs change", async () => {
    const persistence = createMockPersistence();
    const anonymousSession = await persistence.createAnonymousSession({
      expiresAt: "2026-05-22T00:00:00.000Z",
    });
    const analysisSession = await persistence.createAnalysisSession({
      anonymousSessionId: anonymousSession.id,
      region: "cn_mainland",
      currency: "CNY",
      periodStart: "2026-05-01T00:00:00.000Z",
      periodEnd: "2026-05-21T00:00:00.000Z",
    });

    const staleReport = await persistence.saveReport(analysisSession.id, {
      personality: {
        title: "奶茶黑洞人格",
        emoji: "MT",
        description: "你不是在买奶茶，你是在给情绪续命。",
        strengths: ["会奖励自己"],
        weaknesses: ["小额高频支出容易失控"],
        behaviorSummary: "本期奶茶支出偏高。",
      },
      roast: { short: "奶茶不是你的搭子，是你的赛博房东。", safeLevel: "sharp_safe" },
      scores: {
        financialHealth: 68,
        impulse: 82,
        savingsPotential: 61,
        lifestyleEfficiency: 54,
        stability: 72,
      },
      benchmarkInsights: [
        { category: "milk_tea", text: "你的奶茶支出接近学生高频消费组。", confidence: "benchmark" },
      ],
      riskPredictions: [
        { type: "overspending", text: "月底饮品预算可能提前透支。", severity: "medium" },
      ],
      challenge: { title: "奶茶战损挑战", tag: "#本周奶茶战损", description: "晒出你的本周奶茶人格。" },
      shareCopy: { xiaohongshu: "AI 说我是奶茶黑洞人格。", wechat: "我的 AI 消费人格报告出来了。" },
    });
    await persistence.saveShareCard({
      aiReportId: staleReport.id,
      templateType: "xiaohongshu_square",
      platform: "xiaohongshu",
      imageUrl: "mock://share-cards/stale.png",
      challengeTag: "#本周奶茶战损",
      isWatermarked: true,
      ownerType: "anonymous",
    });

    await persistence.saveConfirmedTransactions(analysisSession.id, [
      {
        amount: 120,
        currency: "CNY",
        category: "transport",
        merchant: "地铁和打车",
        transactionTime: "2026-05-20T12:00:00.000Z",
        source: "manual",
        confidence: 1,
      },
    ]);

    const snapshot = await persistence.getAnalysisSnapshot(analysisSession.id);
    expect(snapshot?.confirmedTransactions[0]?.category).toBe("transport");
    expect(snapshot?.report).toBeUndefined();
    expect(snapshot?.shareCards).toHaveLength(0);
    expect(snapshot?.analysisSession.status).toBe("confirmed");
  });
});
