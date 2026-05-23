import type {
  Currency,
  Region,
  SpendingCategory,
  UploadSourceType,
} from "@/types/domain";
import { spendingCategories, uploadSourceTypes } from "@/types/domain";
import type {
  SaveCategoryTotalHintInput,
  SaveConfirmedTransactionInput,
} from "@/server/providers/types";

export type CategoryOption = {
  value: SpendingCategory;
  label: string;
};

const categoryLabels: Record<SpendingCategory, string> = {
  food_delivery: "外卖",
  milk_tea: "奶茶",
  online_shopping: "网购",
  gaming: "游戏",
  transport: "交通",
  campus_cafeteria: "校园餐",
  social_meals: "聚餐",
  study_supplies: "学习用品",
  subscriptions: "订阅",
  other: "其他",
};

const mainlandCategories: SpendingCategory[] = [
  "milk_tea",
  "food_delivery",
  "campus_cafeteria",
  "transport",
  "online_shopping",
  "social_meals",
  "study_supplies",
  "subscriptions",
  "gaming",
  "other",
];

const studyAbroadCategories: SpendingCategory[] = [
  "food_delivery",
  "transport",
  "social_meals",
  "online_shopping",
  "subscriptions",
  "study_supplies",
  "milk_tea",
  "gaming",
  "other",
];

type ManualTransactionInput = {
  amount?: string | number | null;
  currency?: string | null;
  category?: string | null;
  merchant?: string | null;
  note?: string | null;
  transactionTime?: string | null;
};

type CategoryTotalInput = {
  amount?: string | number | null;
  currency?: string | null;
  category?: string | null;
  periodLabel?: string | null;
  note?: string | null;
};

type ScreenshotMetadataInput = {
  sourceType?: string | null;
  fileName?: string | null;
  sizeBytes?: number | string | null;
};

export function getCategoryOptionsForRegion(region: Region): CategoryOption[] {
  const categories = region === "cn_mainland" ? mainlandCategories : studyAbroadCategories;
  return categories.map((category) => ({
    value: category,
    label: categoryLabels[category],
  }));
}

export function getCategoryLabel(category: SpendingCategory) {
  return categoryLabels[category];
}

export function validateManualTransactionInput(
  input: ManualTransactionInput,
): SaveConfirmedTransactionInput {
  const amount = parsePositiveAmount(input.amount);
  const currency = parseCurrency(input.currency);
  const category = parseCategory(input.category);
  const transactionTime = parseTransactionTime(input.transactionTime);
  const merchant = normalizeOptionalText(input.merchant);
  const note = normalizeOptionalText(input.note);

  return {
    amount,
    currency,
    category,
    merchant,
    note,
    transactionTime,
    confidence: 1,
    source: "manual",
  };
}

export function validateCategoryTotalInput(input: CategoryTotalInput): SaveCategoryTotalHintInput {
  return {
    amount: parsePositiveAmount(input.amount),
    currency: parseCurrency(input.currency),
    category: parseCategory(input.category),
    periodLabel: normalizeRequiredText(input.periodLabel, "请输入分类总额对应的周期"),
    note: normalizeOptionalText(input.note),
    confidence: 0.7,
    isEstimate: true,
  };
}

export function validateScreenshotMetadataInput(input: ScreenshotMetadataInput) {
  const sourceType = parseSourceType(input.sourceType);
  const originalName = normalizeRequiredText(input.fileName, "请选择账单截图");
  const sizeBytes = Number(input.sizeBytes ?? 0);

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw new Error("截图文件无效");
  }

  return {
    sourceType,
    originalName,
    sizeBytes,
    ocrStatus: "pending" as const,
  };
}

function parsePositiveAmount(value: ManualTransactionInput["amount"]) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("请输入大于 0 的金额");
  }

  return amount;
}

function parseCurrency(value: string | null | undefined): Currency {
  const currency = String(value ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("请选择有效的货币");
  }

  return currency;
}

function parseCategory(value: string | null | undefined): SpendingCategory {
  const category = String(value ?? "");
  if (!spendingCategories.includes(category as SpendingCategory)) {
    throw new Error("请选择有效的消费分类");
  }

  return category as SpendingCategory;
}

function parseSourceType(value: string | null | undefined): UploadSourceType {
  const sourceType = String(value ?? "");
  if (!uploadSourceTypes.includes(sourceType as UploadSourceType)) {
    throw new Error("请选择截图类型");
  }

  return sourceType as UploadSourceType;
}

function parseTransactionTime(value: string | null | undefined) {
  const raw = normalizeRequiredText(value, "请选择消费时间");
  const isoLike = raw.includes("T") ? raw : `${raw}T00:00`;
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    throw new Error("请选择有效的消费时间");
  }

  return date.toISOString();
}

function normalizeRequiredText(value: string | null | undefined, message: string) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(message);
  }

  return text;
}

function normalizeOptionalText(value: string | null | undefined) {
  const text = String(value ?? "").trim();
  return text ? text : undefined;
}
