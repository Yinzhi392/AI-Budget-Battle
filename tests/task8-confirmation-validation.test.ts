import { describe, expect, it } from "vitest";
import {
  getConfirmationRowBadges,
  validateConfirmationRows,
} from "@/server/confirm/validation";
import { createMockPersistence } from "@/server/providers/mock-persistence";

describe("Task 8 confirmation validation", () => {
  it("validates accepted transaction and aggregate rows for final save", () => {
    const result = validateConfirmationRows([
      {
        id: "tx_1",
        kind: "transaction",
        accepted: true,
        amount: "10",
        currency: "CNY",
        category: "milk_tea",
        merchant: "一点点",
        transactionTime: "2026-05-21T12:00",
        source: "mock_ai",
        confidence: 0.68,
      },
      {
        id: "agg_1",
        kind: "aggregate",
        accepted: true,
        amount: "188",
        currency: "CNY",
        category: "food_delivery",
        periodLabel: "本月",
        note: "支付宝月度汇总",
        source: "mock_ai",
        confidence: 0.72,
        isEstimate: true,
      },
    ]);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: 10,
      category: "milk_tea",
      merchant: "一点点",
      source: "mock_ai",
    });
    expect(result.aggregates).toHaveLength(1);
    expect(result.aggregates[0]).toMatchObject({
      amount: 188,
      category: "food_delivery",
      periodLabel: "本月",
      isEstimate: true,
    });
  });

  it("blocks accepted transaction rows without a valid time", () => {
    expect(() =>
      validateConfirmationRows([
        {
          kind: "transaction",
          accepted: true,
          amount: "10",
          currency: "CNY",
          category: "milk_tea",
          transactionTime: "",
          source: "manual",
          confidence: 1,
        },
      ]),
    ).toThrow("请选择消费时间");
  });

  it("blocks accepted aggregate rows without a period label", () => {
    expect(() =>
      validateConfirmationRows([
        {
          kind: "aggregate",
          accepted: true,
          amount: "88",
          currency: "CNY",
          category: "food_delivery",
          periodLabel: "",
          source: "manual",
          confidence: 0.7,
          isEstimate: true,
        },
      ]),
    ).toThrow("请输入估算周期");
  });

  it("ignores rejected rows when checking confirmation eligibility", () => {
    const result = validateConfirmationRows([
      {
        kind: "transaction",
        accepted: false,
        amount: "",
        currency: "",
        category: "",
        transactionTime: "",
        source: "mock_ai",
        confidence: 0.2,
      },
      {
        kind: "aggregate",
        accepted: true,
        amount: "66",
        currency: "CNY",
        category: "campus_cafeteria",
        periodLabel: "本周",
        source: "manual",
        confidence: 0.7,
        isEstimate: true,
      },
    ]);

    expect(result.transactions).toHaveLength(0);
    expect(result.aggregates).toHaveLength(1);
  });

  it("returns badges for confidence, estimate, duplicate, and overlap markers", () => {
    const badges = getConfirmationRowBadges({
      kind: "aggregate",
      accepted: true,
      amount: 188,
      currency: "CNY",
      category: "food_delivery",
      periodLabel: "本月",
      source: "mock_ai",
      confidence: 0.62,
      isEstimate: true,
      possibleOverlap: true,
      possibleDuplicate: true,
    });

    expect(badges).toEqual(expect.arrayContaining(["估算数据", "置信度偏低", "可能重复", "可能重叠"]));
  });

  it("mock persistence stores accepted aggregate rows separately from upload hints", async () => {
    const persistence = createMockPersistence({
      analysisSessions: [
        {
          id: "analysis_1",
          anonymousSessionId: "anonymous_1",
          region: "cn_mainland",
          currency: "CNY",
          periodStart: "2026-05-01T00:00:00.000Z",
          periodEnd: "2026-05-31T23:59:59.999Z",
          status: "collecting",
          isSaved: false,
          createdAt: "2026-05-21T00:00:00.000Z",
        },
      ],
    });

    await persistence.saveConfirmedAggregates("analysis_1", [
      {
        amount: 188,
        currency: "CNY",
        category: "food_delivery",
        periodLabel: "本月",
        note: "确认后的外卖估算",
        source: "mock_ai",
        confidence: 0.72,
        isEstimate: true,
      },
    ]);

    const snapshot = await persistence.getAnalysisSnapshot("analysis_1");
    expect(snapshot?.confirmedAggregates).toHaveLength(1);
    expect(snapshot?.confirmedAggregates[0]).toMatchObject({
      amount: 188,
      category: "food_delivery",
      isUserConfirmed: true,
    });
    expect(snapshot?.analysisSession.status).toBe("confirmed");
  });
});
