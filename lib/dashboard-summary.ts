import { evaluateScreenshotRetention, type ScreenshotRetentionResult } from "@/server/storage/retention";
import type { AnalysisSnapshot, SpendingCategory } from "@/types/domain";

export type DashboardCategoryBreakdown = {
  category: SpendingCategory;
  label: string;
  amount: number;
  currency: string;
  isEstimate: boolean;
};

export type DashboardSummary = {
  reportId: string;
  analysisSessionId: string;
  personalityTitle: string;
  periodLabel: string;
  totalAmount: number;
  exactTotal: number;
  estimatedTotal: number;
  currency: string;
  transactionSummary: string;
  scoreExplanations: Array<{
    label: string;
    value: number;
    explanation: string;
  }>;
  categoryBreakdown: DashboardCategoryBreakdown[];
  riskNotes: string[];
  retentionItems: ScreenshotRetentionResult[];
};

const categoryLabels: Record<SpendingCategory, string> = {
  food_delivery: "外卖",
  milk_tea: "奶茶",
  online_shopping: "网购",
  gaming: "游戏",
  transport: "交通",
  campus_cafeteria: "校园餐",
  social_meals: "社交聚餐",
  study_supplies: "学习用品",
  subscriptions: "订阅",
  other: "其他",
};

const scoreLabels = {
  financialHealth: "财务生命值",
  impulse: "冲动指数",
  savingsPotential: "存钱潜力",
  lifestyleEfficiency: "生活效率",
  stability: "稳定性",
} as const;

export function buildDashboardSummary(
  snapshot: AnalysisSnapshot,
  options: {
    now: string;
  },
): DashboardSummary {
  if (!snapshot.report) {
    throw new Error("Dashboard summary requires a generated report.");
  }

  const exactTotal = sum(snapshot.confirmedTransactions.map((item) => item.amount));
  const estimatedTotal = sum(snapshot.confirmedAggregates.map((item) => item.amount));
  const categoryAmounts = new Map<SpendingCategory, DashboardCategoryBreakdown>();

  for (const transaction of snapshot.confirmedTransactions) {
    addCategoryAmount(categoryAmounts, {
      category: transaction.category,
      amount: transaction.amount,
      currency: transaction.currency,
      isEstimate: false,
    });
  }

  for (const aggregate of snapshot.confirmedAggregates) {
    addCategoryAmount(categoryAmounts, {
      category: aggregate.category,
      amount: aggregate.amount,
      currency: aggregate.currency,
      isEstimate: true,
    });
  }

  const categoryBreakdown = Array.from(categoryAmounts.values()).sort(
    (left, right) => right.amount - left.amount,
  );
  const analysisCompleted = Boolean(snapshot.report);

  return {
    reportId: snapshot.report.id,
    analysisSessionId: snapshot.analysisSession.id,
    personalityTitle: snapshot.report.personality.title,
    periodLabel: formatPeriod(snapshot.analysisSession.periodStart, snapshot.analysisSession.periodEnd),
    totalAmount: exactTotal + estimatedTotal,
    exactTotal,
    estimatedTotal,
    currency: snapshot.analysisSession.currency,
    transactionSummary: `${snapshot.confirmedTransactions.length} 笔确认交易 / ${snapshot.confirmedAggregates.length} 条估算汇总`,
    scoreExplanations: Object.entries(snapshot.report.scores).map(([key, value]) => ({
      label: scoreLabels[key as keyof typeof scoreLabels],
      value,
      explanation: explainScore(key as keyof typeof scoreLabels, value),
    })),
    categoryBreakdown,
    riskNotes: snapshot.report.riskPredictions.map((prediction) => prediction.text),
    retentionItems: snapshot.uploadedImages.map((image) =>
      evaluateScreenshotRetention(image, {
        now: options.now,
        analysisCompleted,
      }),
    ),
  };
}

function addCategoryAmount(
  categoryAmounts: Map<SpendingCategory, DashboardCategoryBreakdown>,
  item: {
    category: SpendingCategory;
    amount: number;
    currency: string;
    isEstimate: boolean;
  },
) {
  const current = categoryAmounts.get(item.category);
  categoryAmounts.set(item.category, {
    category: item.category,
    label: categoryLabels[item.category],
    amount: (current?.amount ?? 0) + item.amount,
    currency: item.currency,
    isEstimate: Boolean(current?.isEstimate || item.isEstimate),
  });
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function explainScore(key: keyof typeof scoreLabels, value: number) {
  if (key === "impulse") {
    return value >= 75 ? "冲动指数偏高，适合重点观察小额高频消费。" : "冲动指数可控。";
  }

  if (key === "savingsPotential") {
    return value >= 70 ? "还有明显可挖的存钱空间。" : "存钱空间有限，先看大类结构。";
  }

  return value >= 70 ? "本项表现相对稳。" : "本项可以作为下一轮挑战目标。";
}

function formatPeriod(periodStart: string, periodEnd: string) {
  return `${periodStart.slice(0, 10)} - ${periodEnd.slice(0, 10)}`;
}
