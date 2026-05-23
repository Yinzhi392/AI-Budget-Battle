import type {
  ExtractionSourcePlatform,
  SpendingCategory,
  TransactionSource,
  UploadSourceType,
} from "@/types/domain";
import {
  spendingCategories,
  uploadSourceTypes,
} from "@/types/domain";
import type {
  SaveConfirmedAggregateInput,
  SaveConfirmedTransactionInput,
} from "@/server/providers/types";

export type ConfirmationRowKind = "transaction" | "aggregate";

export type ConfirmationRowInput = {
  id?: string;
  kind: ConfirmationRowKind;
  accepted: boolean;
  amount?: string | number | null;
  currency?: string | null;
  category?: string | null;
  merchant?: string | null;
  note?: string | null;
  transactionTime?: string | null;
  periodLabel?: string | null;
  source?: TransactionSource;
  sourceImageId?: string;
  sourceType?: UploadSourceType;
  sourcePlatform?: ExtractionSourcePlatform;
  confidence?: string | number | null;
  dedupeKey?: string;
  overlapGroupId?: string;
  possibleDuplicate?: boolean;
  possibleOverlap?: boolean;
  isEstimate?: boolean;
};

export type ConfirmationValidationResult = {
  transactions: SaveConfirmedTransactionInput[];
  aggregates: SaveConfirmedAggregateInput[];
};

export function validateConfirmationRows(
  rows: ConfirmationRowInput[],
): ConfirmationValidationResult {
  const acceptedRows = rows.filter((row) => row.accepted);

  if (acceptedRows.length === 0) {
    throw new Error("请至少确认一条交易或估算汇总");
  }

  const transactions: SaveConfirmedTransactionInput[] = [];
  const aggregates: SaveConfirmedAggregateInput[] = [];

  for (const row of acceptedRows) {
    if (row.kind === "transaction") {
      transactions.push(validateTransactionRow(row));
    } else {
      aggregates.push(validateAggregateRow(row));
    }
  }

  return { transactions, aggregates };
}

export function getConfirmationRowBadges(row: ConfirmationRowInput) {
  const badges: string[] = [];

  if (row.kind === "aggregate" || row.isEstimate) {
    badges.push("估算数据");
  }
  if (parseConfidence(row.confidence) < 0.8) {
    badges.push("置信度偏低");
  }
  if (row.possibleDuplicate) {
    badges.push("可能重复");
  }
  if (row.possibleOverlap) {
    badges.push("可能重叠");
  }

  const sourceTypeLabel = getSourceTypeLabel(row.sourceType);
  if (sourceTypeLabel) {
    badges.push(sourceTypeLabel);
  }

  return badges;
}

function validateTransactionRow(row: ConfirmationRowInput): SaveConfirmedTransactionInput {
  return {
    id: normalizeOptionalText(row.id),
    amount: parsePositiveAmount(row.amount),
    currency: parseCurrency(row.currency),
    category: parseCategory(row.category),
    merchant: normalizeOptionalText(row.merchant),
    note: normalizeOptionalText(row.note),
    transactionTime: parseTransactionTime(row.transactionTime),
    sourceImageId: normalizeOptionalText(row.sourceImageId),
    confidence: parseConfidence(row.confidence),
    source: parseSource(row.source),
  };
}

function validateAggregateRow(row: ConfirmationRowInput): SaveConfirmedAggregateInput {
  return {
    id: normalizeOptionalText(row.id),
    amount: parsePositiveAmount(row.amount),
    currency: parseCurrency(row.currency),
    category: parseCategory(row.category),
    periodLabel: normalizeRequiredText(row.periodLabel, "请输入估算周期"),
    note: normalizeOptionalText(row.note),
    source: parseSource(row.source),
    sourceImageId: normalizeOptionalText(row.sourceImageId),
    sourceType: parseOptionalSourceType(row.sourceType),
    sourcePlatform: row.sourcePlatform,
    confidence: parseConfidence(row.confidence),
    dedupeKey: normalizeOptionalText(row.dedupeKey),
    overlapGroupId: normalizeOptionalText(row.overlapGroupId),
    possibleDuplicate: Boolean(row.possibleDuplicate),
    possibleOverlap: Boolean(row.possibleOverlap),
    isEstimate: true,
  };
}

function parsePositiveAmount(value: ConfirmationRowInput["amount"]) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("请输入大于 0 的金额");
  }

  return amount;
}

function parseCurrency(value: string | null | undefined) {
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

function parseTransactionTime(value: string | null | undefined) {
  const raw = normalizeRequiredText(value, "请选择消费时间");
  const isoLike = raw.includes("T") ? raw : `${raw}T00:00`;
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    throw new Error("请选择有效的消费时间");
  }

  return date.toISOString();
}

function parseConfidence(value: ConfirmationRowInput["confidence"]) {
  const confidence = value === undefined || value === null || value === "" ? 1 : Number(value);
  if (!Number.isFinite(confidence)) {
    return 0;
  }

  return Math.min(1, Math.max(0, confidence));
}

function parseSource(source: TransactionSource | undefined): TransactionSource {
  if (source === "mock_ai" || source === "ocr" || source === "manual") {
    return source;
  }

  return "manual";
}

function parseOptionalSourceType(sourceType: UploadSourceType | undefined) {
  if (!sourceType) {
    return undefined;
  }

  return uploadSourceTypes.includes(sourceType) ? sourceType : undefined;
}

function getSourceTypeLabel(sourceType: UploadSourceType | undefined) {
  const labels: Record<UploadSourceType, string> = {
    monthly_summary: "月度汇总",
    representative_daily: "代表日账单",
    category_summary: "分类汇总",
    single_transaction: "单笔截图",
  };

  return sourceType ? labels[sourceType] : undefined;
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
