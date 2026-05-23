import { describe, expect, it } from "vitest";
import {
  getCategoryOptionsForRegion,
  validateCategoryTotalInput,
  validateManualTransactionInput,
  validateScreenshotMetadataInput,
} from "@/server/upload/validation";

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
});
