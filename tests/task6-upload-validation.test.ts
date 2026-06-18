import { describe, expect, it } from "vitest";
import {
  getCategoryOptionsForRegion,
  validateCategoryTotalInput,
  validateManualTransactionInput,
  validateScreenshotMetadataInput,
} from "@/server/upload/validation";
import { createMockPersistence } from "@/server/providers/mock-persistence";
import { recoverUploadAnalysisSession } from "@/server/upload/session-recovery";

describe("Task 6 upload validation", () => {
  it("validates a manual transaction with required amount, category, currency, and time", () => {
    expect(
      validateManualTransactionInput({
        amount: "10.5",
        currency: "CNY",
        category: "milk_tea",
        merchant: "一点点",
        transactionTime: "2026-05-21T12:00:00.000Z",
      }),
    ).toMatchObject({
      amount: 10.5,
      currency: "CNY",
      category: "milk_tea",
      merchant: "一点点",
      source: "manual",
    });
  });

  it("rejects invalid manual transaction values with clear messages", () => {
    expect(() =>
      validateManualTransactionInput({
        amount: "0",
        currency: "CNY",
        category: "milk_tea",
        transactionTime: "2026-05-21T12:00:00.000Z",
      }),
    ).toThrow("请输入大于 0 的金额");

    expect(() =>
      validateManualTransactionInput({
        amount: "12",
        currency: "CNY",
        category: "unknown",
        transactionTime: "2026-05-21T12:00:00.000Z",
      }),
    ).toThrow("请选择有效的消费分类");
  });

  it("validates category-level totals as estimated input", () => {
    expect(
      validateCategoryTotalInput({
        amount: "188",
        currency: "CNY",
        category: "food_delivery",
        periodLabel: "本月",
        note: "支付宝月度分析",
      }),
    ).toEqual({
      amount: 188,
      currency: "CNY",
      category: "food_delivery",
      periodLabel: "本月",
      note: "支付宝月度分析",
      confidence: 0.7,
      isEstimate: true,
    });
  });

  it("validates screenshot metadata without requiring daily screenshots", () => {
    expect(
      validateScreenshotMetadataInput({
        sourceType: "monthly_summary",
        fileName: "alipay-monthly.png",
        sizeBytes: 42_000,
      }),
    ).toEqual({
      sourceType: "monthly_summary",
      originalName: "alipay-monthly.png",
      sizeBytes: 42_000,
      ocrStatus: "pending",
    });
  });

  it("uses China mainland student categories by default", () => {
    expect(getCategoryOptionsForRegion("cn_mainland").map((category) => category.value)).toEqual(
      expect.arrayContaining(["milk_tea", "food_delivery", "campus_cafeteria"]),
    );
  });

  it("recovers an upload analysis session when mock memory is missing but setup cookies remain", async () => {
    const cookieStore = createCookieStore({
      abb_anonymous_session: "anonymous_from_cookie",
      abb_region: "cn_mainland",
      abb_currency: "CNY",
      abb_period_type: "this_month",
      abb_period_start: "2026-05-01",
      abb_period_end: "2026-05-23",
      abb_analysis_session: "analysis_missing_after_serverless_reset",
    });
    const persistence = createMockPersistence();

    const analysisSessionId = await recoverUploadAnalysisSession({
      cookieStore,
      persistence,
      setup: {
        anonymousSessionId: "anonymous_from_cookie",
        region: "cn_mainland",
        currency: "CNY",
        periodType: "this_month",
        periodStart: "2026-05-01",
        periodEnd: "2026-05-23",
        analysisSessionId: "analysis_missing_after_serverless_reset",
      },
    });

    expect(analysisSessionId).toBe("analysis_1");
    expect(cookieStore.get("abb_analysis_session")?.value).toBe("analysis_1");

    await expect(
      persistence.saveConfirmedTransactions(analysisSessionId!, [
        validateManualTransactionInput({
          amount: "10",
          currency: "CNY",
          category: "milk_tea",
          merchant: "一点点",
          transactionTime: "2026-05-21T12:00:00.000Z",
        }),
      ]),
    ).resolves.toHaveLength(1);
  });
});

function createCookieStore(initial: Record<string, string>) {
  const store = new Map(Object.entries(initial));

  return {
    get(name: string) {
      const value = store.get(name);
      return value ? { value } : undefined;
    },
    set(name: string, value: string) {
      store.set(name, value);
    },
  };
}
