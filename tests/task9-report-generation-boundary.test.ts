import { describe, expect, it } from "vitest";
import { aiReportSchema } from "@/server/ai/schemas";
import {
  assertReportIsSafe,
  containsForbiddenBenchmarkClaim,
  containsUnsafeRoast,
} from "@/server/reports/safety";
import {
  runReportGeneration,
  runReportGenerationWithProvider,
  selectReportProvider,
} from "@/server/providers/report-provider";
import { isReportStaleForConfirmedInput } from "@/server/reports/staleness";
import { createMockAiProvider } from "@/server/providers/mock-ai";
import { type OpenAiResponsesClient } from "@/server/providers/openai-json";
import { createOpenAiReportProvider } from "@/server/providers/openai-report";
import type { GenerateReportInput } from "@/server/providers/types";
import type { AnalysisSnapshot, SpendingCategory } from "@/types/domain";

const baseInput: GenerateReportInput = {
  analysisSessionId: "analysis_1",
  region: "cn_mainland",
  currency: "CNY",
  periodStart: "2026-05-01T00:00:00.000Z",
  periodEnd: "2026-05-31T23:59:59.999Z",
  confirmedTransactions: [
    {
      id: "transaction_1",
      analysisSessionId: "analysis_1",
      amount: 10,
      currency: "CNY",
      category: "milk_tea",
      merchant: "一点点",
      transactionTime: "2026-05-21T12:00:00.000Z",
      source: "manual",
      confidence: 1,
      isUserConfirmed: true,
      createdAt: "2026-05-21T00:00:00.000Z",
    },
  ],
  confirmedAggregates: [
    {
      id: "aggregate_1",
      analysisSessionId: "analysis_1",
      amount: 188,
      currency: "CNY",
      category: "food_delivery",
      periodLabel: "本月",
      note: "确认后的外卖估算",
      source: "mock_ai",
      confidence: 0.72,
      isEstimate: true,
      isUserConfirmed: true,
      createdAt: "2026-05-21T00:00:00.000Z",
    },
  ],
};

const validReport = {
  personality: {
    title: "奶茶黑洞人格",
    emoji: "MT",
    description: "你不是在买奶茶，你是在给情绪续命。",
    strengths: ["会奖励自己"],
    weaknesses: ["小额高频支出容易失控"],
    behaviorSummary: "本期包含 1 笔确认交易和 1 条估算汇总。",
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
};

function inputWithCategory(category: SpendingCategory, amount = 120): GenerateReportInput {
  return {
    ...baseInput,
    confirmedTransactions: [
      {
        id: `transaction_${category}`,
        analysisSessionId: "analysis_1",
        amount,
        currency: "CNY",
        category,
        merchant: category,
        transactionTime: "2026-05-21T12:00:00.000Z",
        source: "manual",
        confidence: 1,
        isUserConfirmed: true,
        createdAt: "2026-05-21T00:00:00.000Z",
      },
    ],
    confirmedAggregates: [],
  };
}

describe("Task 9 report generation boundary", () => {
  it("selects mock report generation by default", () => {
    const selected = selectReportProvider({});

    expect(selected.name).toBe("mock");
    expect(selected.provider).toBeDefined();
  });

  it("returns recoverable unavailable when OpenAI report provider lacks server config", async () => {
    const result = await runReportGeneration(baseInput, { AI_REPORT_PROVIDER: "openai" });

    if (result.ok) {
      throw new Error("Expected OpenAI report generation to be unavailable without config.");
    }
    expect(result.recoverable).toBe(true);
    expect(result.message).toMatch(/OpenAI report generation is not configured/);
  });

  it("does not use public OpenAI env vars for report provider selection", async () => {
    const result = await runReportGeneration(baseInput, {
      AI_REPORT_PROVIDER: "openai",
      NEXT_PUBLIC_OPENAI_API_KEY: "public-key-must-be-ignored",
      OPENAI_REPORT_MODEL: "gpt-test",
    });

    if (result.ok) {
      throw new Error("Expected report generation to fail without server-only OPENAI_API_KEY.");
    }
    expect(result.message).toMatch(/OPENAI_API_KEY/);

    const selected = selectReportProvider({
      AI_REPORT_PROVIDER: "openai",
      OPENAI_API_KEY: "server-secret",
      OPENAI_REPORT_MODEL: "gpt-test",
      NEXT_PUBLIC_OPENAI_API_KEY: "public-key-must-be-ignored",
    });
    expect(selected.name).toBe("openai");
    expect(selected.provider).toBeDefined();
    expect(JSON.stringify(selected)).not.toContain("server-secret");
  });

  it("mock report generation produces schema-valid safe report data from confirmed rows and aggregates", async () => {
    const result = await runReportGenerationWithProvider(createMockAiProvider(), baseInput);

    if (!result.ok) {
      throw new Error(result.message);
    }
    const parsed = aiReportSchema.parse(result.report);
    expect(parsed.personality.behaviorSummary).toContain("估算");
    expect(parsed.benchmarkInsights[0]?.text).not.toMatch(/排名|percentile|前\s*\d+%/i);
  });

  it("mock report generation chooses personas from the dominant confirmed category", async () => {
    const provider = createMockAiProvider();
    const cases: Array<[SpendingCategory, string]> = [
      ["milk_tea", "奶茶黑洞人格"],
      ["food_delivery", "外卖依赖人格"],
      ["gaming", "游戏氪金战神人格"],
      ["online_shopping", "网购拆箱成瘾人格"],
      ["transport", "出门即打车人格"],
      ["social_meals", "社交燃烧人格"],
    ];

    for (const [category, expectedPersona] of cases) {
      const result = await runReportGenerationWithProvider(provider, inputWithCategory(category));

      if (!result.ok) {
        throw new Error(result.message);
      }
      expect(result.report.personality.title).toBe(expectedPersona);
    }
  });

  it("mock report generation supports combination personas", async () => {
    const provider = createMockAiProvider();
    const result = await runReportGenerationWithProvider(provider, {
      ...baseInput,
      confirmedTransactions: [
        {
          ...inputWithCategory("online_shopping", 90).confirmedTransactions[0],
          id: "shopping_1",
        },
        {
          ...inputWithCategory("social_meals", 80).confirmedTransactions[0],
          id: "social_1",
        },
        {
          ...inputWithCategory("subscriptions", 70).confirmedTransactions[0],
          id: "subscription_1",
        },
      ],
      confirmedAggregates: [],
    });

    if (!result.ok) {
      throw new Error(result.message);
    }
    expect(result.report.personality.title).toBe("假精致人格");
  });

  it("detects stale saved reports when confirmed input changes category", () => {
    const staleSnapshot: AnalysisSnapshot = {
      analysisSession: {
        id: "analysis_1",
        anonymousSessionId: "anonymous_1",
        region: "cn_mainland",
        currency: "CNY",
        periodStart: "2026-05-01T00:00:00.000Z",
        periodEnd: "2026-05-31T23:59:59.999Z",
        status: "confirmed",
        isSaved: false,
        createdAt: "2026-05-21T00:00:00.000Z",
      },
      uploadedImages: [],
      confirmedTransactions: [
        {
          ...inputWithCategory("transport", 120).confirmedTransactions[0],
          id: "transport_1",
        },
      ],
      confirmedAggregates: [],
      categoryTotalHints: [],
      report: {
        id: "report_1",
        analysisSessionId: "analysis_1",
        ...aiReportSchema.parse(validReport),
        generatedAt: "2026-05-21T00:00:00.000Z",
      },
      shareCards: [],
    };

    expect(isReportStaleForConfirmedInput(staleSnapshot)).toBe(true);
  });

  it("rejects invalid AI report structure as recoverable failure", async () => {
    const result = await runReportGenerationWithProvider(
      {
        async extractTransactions() {
          return { transactionCandidates: [], aggregateCandidates: [], warnings: [] };
        },
        async generateReport() {
          return { scores: { impulse: 101 } };
        },
      },
      baseInput,
    );

    expect(result.ok).toBe(false);
  });

  it("OpenAI report generation retries invalid structured output once and validates the repair", async () => {
    const calls: Array<{ model: string; input: Array<{ role: string; content: string }> }> = [];
    const fakeClient: OpenAiResponsesClient = {
      responses: {
        async create(input) {
          calls.push(input);
          return {
            output_text:
              calls.length === 1
                ? JSON.stringify({ scores: { impulse: 101 } })
                : JSON.stringify(validReport),
          };
        },
      },
    };
    const provider = createOpenAiReportProvider({
      apiKey: "server-secret",
      model: "gpt-test",
      timeoutMs: 5_000,
      client: fakeClient,
    });

    const result = await runReportGenerationWithProvider(provider, baseInput);

    if (!result.ok) {
      throw new Error(result.message);
    }
    expect(calls).toHaveLength(2);
    expect(calls[1]?.input.at(-1)?.content).toContain("previous output was invalid");
    expect(result.report.personality.title).toBe("奶茶黑洞人格");
  });

  it("OpenAI report timeout is returned as a recoverable failure", async () => {
    const fakeClient: OpenAiResponsesClient = {
      responses: {
        async create() {
          await new Promise((resolve) => setTimeout(resolve, 20));
          return { output_text: "{}" };
        },
      },
    };
    const provider = createOpenAiReportProvider({
      apiKey: "server-secret",
      model: "gpt-test",
      timeoutMs: 1,
      client: fakeClient,
    });

    const result = await runReportGenerationWithProvider(provider, baseInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/timed out/i);
    }
  });

  it("blocks unsafe roast output before saving", async () => {
    expect(containsUnsafeRoast("你这种穷鬼就别消费了")).toBe(true);

    const result = await runReportGenerationWithProvider(
      {
        async extractTransactions() {
          return { transactionCandidates: [], aggregateCandidates: [], warnings: [] };
        },
        async generateReport() {
          return {
            ...validReport,
            roast: { short: "你这种穷鬼就别消费了", safeLevel: "sharp_safe" },
          };
        },
      },
      baseInput,
    );

    expect(result.ok).toBe(false);
  });

  it("rejects benchmark wording that claims real ranking or percentile", () => {
    expect(containsForbiddenBenchmarkClaim("你超过了全校 99% 的真实用户")).toBe(true);
    expect(() =>
      assertReportIsSafe({
        ...validReport,
        benchmarkInsights: [
          {
            category: "milk_tea",
            text: "你在全校真实排名第 1。",
            confidence: "benchmark",
          },
        ],
      }),
    ).toThrow(/真实排名|百分位|percentile|全校/);
  });
});
