import type {
  AiReport,
  AnalysisSnapshot,
  ConfirmedAggregateItem,
  SpendingCategory,
  TransactionItem,
} from "@/types/domain";

type ReportInputItem = Pick<TransactionItem | ConfirmedAggregateItem, "amount" | "category">;

const categories: SpendingCategory[] = [
  "food_delivery",
  "milk_tea",
  "online_shopping",
  "gaming",
  "transport",
  "campus_cafeteria",
  "social_meals",
  "study_supplies",
  "subscriptions",
  "other",
];

const personaByCategory: Record<SpendingCategory, string> = {
  food_delivery: "外卖依赖人格",
  milk_tea: "奶茶黑洞人格",
  online_shopping: "网购拆箱成瘾人格",
  gaming: "游戏氪金战神人格",
  transport: "出门即打车人格",
  campus_cafeteria: "生存模式人格",
  social_meals: "社交燃烧人格",
  study_supplies: "卷王燃烧人格",
  subscriptions: "焦虑奋斗人格",
  other: "生存模式人格",
};

export function isReportStaleForConfirmedInput(snapshot: AnalysisSnapshot): boolean {
  if (!snapshot.report) {
    return false;
  }

  return snapshot.report.personality.title !== getExpectedPersonaTitle([
    ...snapshot.confirmedTransactions,
    ...snapshot.confirmedAggregates,
  ]);
}

export function shouldReuseExistingReport(snapshot: AnalysisSnapshot): snapshot is AnalysisSnapshot & {
  report: AiReport;
} {
  return Boolean(
    snapshot.report &&
      (snapshot.analysisSession.status === "report_generated" ||
        snapshot.analysisSession.status === "saved") &&
      !isReportStaleForConfirmedInput(snapshot),
  );
}

function getExpectedPersonaTitle(items: ReportInputItem[]) {
  const totals = Object.fromEntries(
    categories.map((category) => [category, sumByCategory(items, category)]),
  ) as Record<SpendingCategory, number>;
  const totalAmount = Object.values(totals).reduce((total, amount) => total + amount, 0);
  const dominant = Object.entries(totals).sort((left, right) => right[1] - left[1])[0] as
    | [SpendingCategory, number]
    | undefined;

  if (!dominant || totalAmount <= 0) {
    return "生存模式人格";
  }

  const [dominantCategory, dominantAmount] = dominant;
  if (dominantAmount / totalAmount >= 0.5) {
    return personaByCategory[dominantCategory];
  }

  const fakeRefinedTotal =
    totals.online_shopping + totals.social_meals + totals.subscriptions;
  const anxiousHustlerTotal =
    totals.study_supplies + totals.subscriptions + totals.transport;
  const survivalTotal = totals.campus_cafeteria + totals.transport + totals.other;

  if (fakeRefinedTotal >= dominantAmount * 1.6) {
    return "假精致人格";
  }

  if (anxiousHustlerTotal >= dominantAmount * 1.6) {
    return "焦虑奋斗人格";
  }

  if (survivalTotal >= dominantAmount * 1.6) {
    return "生存模式人格";
  }

  return personaByCategory[dominantCategory];
}

function sumByCategory(items: ReportInputItem[], category: SpendingCategory) {
  return items
    .filter((item) => item.category === category)
    .reduce((total, item) => total + item.amount, 0);
}
