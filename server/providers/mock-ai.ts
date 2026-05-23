import { aiReportSchema, extractionOutputSchema } from "@/server/ai/schemas";
import type { AiProvider } from "@/server/providers/types";
import type {
  ConfirmedAggregateItem,
  ExtractionAggregateCandidate,
  ExtractionSourcePlatform,
  ExtractionTransactionCandidate,
  SpendingCategory,
  TransactionItem,
  UploadedImageMetadata,
} from "@/types/domain";

type ReportInputItem = Pick<TransactionItem | ConfirmedAggregateItem, "amount" | "category">;

type PersonaProfile = {
  title: string;
  emoji: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  behaviorFocus: string;
  roast: string;
  benchmarkCategory: SpendingCategory;
  benchmarkText: string;
  riskText: string;
  challengeTitle: string;
  challengeTag: string;
  challengeDescription: string;
  shareText: string;
};

export function createMockAiProvider(): AiProvider {
  return {
    async extractTransactions(input) {
      if (input.uploadedImages.some((image) => image.originalName.includes("force-extraction-failure"))) {
        throw new Error("Forced mock extraction failure.");
      }

      const hasSummary = input.uploadedImages.some(
        (image) => image.sourceType === "monthly_summary" || image.sourceType === "category_summary",
      );
      const hasDetail = input.uploadedImages.some(
        (image) => image.sourceType === "representative_daily" || image.sourceType === "single_transaction",
      );
      const overlapGroupId = hasSummary && hasDetail ? "mixed-source-1" : undefined;

      const transactionCandidates = input.uploadedImages
        .filter((image) => image.sourceType === "representative_daily" || image.sourceType === "single_transaction")
        .map((image) => createTransactionCandidate(image, overlapGroupId));
      const aggregateCandidates = input.uploadedImages
        .filter((image) => image.sourceType === "monthly_summary" || image.sourceType === "category_summary")
        .map((image) => createAggregateCandidate(image, overlapGroupId));

      return extractionOutputSchema.parse({
        transactionCandidates,
        aggregateCandidates,
        warnings: hasSummary && hasDetail
          ? ["检测到月度汇总和日账单可能重叠，后续确认页应提示用户不要直接相加。"]
          : [],
      });
    },

    async generateReport(input) {
      const reportInputs = [
        ...input.confirmedTransactions,
        ...(input.confirmedAggregates ?? []),
      ];
      const persona = selectPersonaProfile(reportInputs);
      const aggregateCount = input.confirmedAggregates?.length ?? 0;

      return aiReportSchema.parse({
        personality: {
          title: persona.title,
          emoji: persona.emoji,
          description: persona.description,
          strengths: persona.strengths,
          weaknesses: persona.weaknesses,
          behaviorSummary: aggregateCount > 0
            ? `本期包含 ${input.confirmedTransactions.length} 笔确认交易和 ${aggregateCount} 条估算汇总，${persona.behaviorFocus} 是主要观察项。`
            : `本期共确认 ${input.confirmedTransactions.length} 笔交易，${persona.behaviorFocus} 是主要观察项。`,
        },
        roast: {
          short: persona.roast,
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
            category: persona.benchmarkCategory,
            text: persona.benchmarkText,
            confidence: "benchmark",
          },
        ],
        riskPredictions: [
          {
            type: "overspending",
            text: persona.riskText,
            severity: "medium",
          },
        ],
        challenge: {
          title: persona.challengeTitle,
          tag: persona.challengeTag,
          description: persona.challengeDescription,
        },
        shareCopy: {
          xiaohongshu: persona.shareText,
          wechat: "我的 AI 消费人格报告出来了。",
        },
      });
    },
  };
}

function createTransactionCandidate(
  image: UploadedImageMetadata,
  overlapGroupId?: string,
): ExtractionTransactionCandidate {
  const category = classifySpendingText(image.originalName);
  const merchant = category === "milk_tea" ? "一点点" : category === "food_delivery" ? "外卖平台" : "截图商户";

  return {
    amount: category === "milk_tea" ? 10 : 32,
    currency: "CNY",
    category,
    merchant,
    note: "截图识别候选：代表性消费",
    transactionTime: "2026-05-20T08:30:00.000Z",
    sourceImageId: image.id,
    sourceType: image.sourceType,
    sourcePlatform: inferSourcePlatform(image.originalName),
    confidence: category === "milk_tea" ? 0.9 : 0.78,
    dedupeKey: `${image.id}:${category}:2026-05-20`,
    overlapGroupId,
    possibleDuplicate: Boolean(overlapGroupId),
    isEstimate: false,
  };
}

function createAggregateCandidate(
  image: UploadedImageMetadata,
  overlapGroupId?: string,
): ExtractionAggregateCandidate {
  const category = classifySpendingText(image.originalName);

  return {
    amount: category === "milk_tea" ? 86 : 188,
    currency: "CNY",
    category,
    periodLabel: image.sourceType === "monthly_summary" ? "本月" : "分类汇总",
    note: "截图汇总候选：估算分类总额",
    sourceImageId: image.id,
    sourceType: image.sourceType,
    sourcePlatform: inferSourcePlatform(image.originalName),
    confidence: 0.72,
    dedupeKey: `${image.id}:${category}:aggregate`,
    overlapGroupId,
    possibleOverlap: true,
    isEstimate: true,
  };
}

export function classifySpendingText(text: string): SpendingCategory {
  if (/一点点|奶茶|喜茶|蜜雪|茶百道|coco/i.test(text)) {
    return "milk_tea";
  }
  if (/外卖|美团|饿了么|夜宵|takeaway|delivery/i.test(text)) {
    return "food_delivery";
  }
  if (/交通|地铁|公交|grab|uber|打车/i.test(text)) {
    return "transport";
  }
  if (/游戏|steam|王者|原神/i.test(text)) {
    return "gaming";
  }
  if (/订阅|netflix|spotify|会员/i.test(text)) {
    return "subscriptions";
  }

  return "other";
}

function inferSourcePlatform(text: string): ExtractionSourcePlatform {
  if (/alipay|支付宝/i.test(text)) {
    return "alipay";
  }
  if (/wechat|微信/i.test(text)) {
    return "wechat";
  }
  if (/bank|银行/i.test(text)) {
    return "bank";
  }

  return "unknown";
}

function sumByCategory(
  transactions: Array<{ amount: number; category: string }>,
  category: string,
) {
  return transactions
    .filter((transaction) => transaction.category === category)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function selectPersonaProfile(items: ReportInputItem[]): PersonaProfile {
  const totals = Object.fromEntries(
    [
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
    ].map((category) => [category, sumByCategory(items, category)]),
  ) as Record<SpendingCategory, number>;

  const totalAmount = Object.values(totals).reduce((total, amount) => total + amount, 0);
  const dominant = Object.entries(totals).sort((left, right) => right[1] - left[1])[0] as
    | [SpendingCategory, number]
    | undefined;

  if (!dominant || totalAmount <= 0) {
    return personaProfiles.campus_cafeteria;
  }

  const [dominantCategory, dominantAmount] = dominant;
  if (dominantAmount / totalAmount >= 0.5) {
    return personaProfiles[dominantCategory];
  }

  const fakeRefinedTotal =
    totals.online_shopping + totals.social_meals + totals.subscriptions;
  const anxiousHustlerTotal =
    totals.study_supplies + totals.subscriptions + totals.transport;
  const survivalTotal = totals.campus_cafeteria + totals.transport + totals.other;

  if (fakeRefinedTotal >= dominantAmount * 1.6) {
    return personaProfiles.fake_refined;
  }

  if (anxiousHustlerTotal >= dominantAmount * 1.6) {
    return personaProfiles.anxious_hustler;
  }

  if (survivalTotal >= dominantAmount * 1.6) {
    return personaProfiles.survival_mode;
  }

  return personaProfiles[dominantCategory];
}

const personaProfiles: Record<SpendingCategory | "fake_refined" | "anxious_hustler" | "survival_mode", PersonaProfile> = {
  milk_tea: {
    title: "奶茶黑洞人格",
    emoji: "MT",
    description: "你不是在买奶茶，你是在给情绪续命。",
    strengths: ["会奖励自己", "生活节奏清晰"],
    weaknesses: ["小额高频支出容易失控"],
    behaviorFocus: "奶茶和小额高频消费",
    roast: "奶茶不是你的搭子，是你的赛博房东：每天准点收租，余额看了都想退退退。",
    benchmarkCategory: "milk_tea",
    benchmarkText: "你的奶茶支出接近学生高频消费组。",
    riskText: "如果保持这个节奏，小额饮品预算会在月底前提前投降。",
    challengeTitle: "奶茶战损挑战",
    challengeTag: "#本周奶茶战损",
    challengeDescription: "晒出你的本周奶茶人格。",
    shareText: "AI 说我是奶茶黑洞人格，笑死但有点准。",
  },
  food_delivery: {
    title: "外卖依赖人格",
    emoji: "WM",
    description: "你的餐桌半径由骑手决定。",
    strengths: ["时间管理直接", "能把饥饿处理得很快"],
    weaknesses: ["外卖频率容易把预算吃穿"],
    behaviorFocus: "外卖和即时满足消费",
    roast: "你的厨房已经进入省电模式，外卖平台才是你的隐藏室友。",
    benchmarkCategory: "food_delivery",
    benchmarkText: "你的外卖支出高于学生基准线。",
    riskText: "如果保持这个节奏，月底餐饮预算会先一步下班。",
    challengeTitle: "外卖冷却挑战",
    challengeTag: "#本周少点一次",
    challengeDescription: "本周少点一次外卖，把预算从骑手手里抢回来。",
    shareText: "AI 说我是外卖依赖人格，多少有点扎心。",
  },
  gaming: {
    title: "游戏氪金战神人格",
    emoji: "GG",
    description: "你不是在消费，你是在给虚拟战力点火。",
    strengths: ["目标感强", "快乐来得很直接"],
    weaknesses: ["皮肤和道具容易绕过理智防线"],
    behaviorFocus: "游戏和娱乐充值",
    roast: "你的余额看起来没掉血，其实已经被一套皮肤打出暴击。",
    benchmarkCategory: "gaming",
    benchmarkText: "你的游戏支出接近学生娱乐消费偏高区间。",
    riskText: "继续冲动充值，娱乐预算可能会被活动礼包提前清空。",
    challengeTitle: "冷却一周挑战",
    challengeTag: "#本周不氪也能赢",
    challengeDescription: "给充值按钮上一层冷却时间。",
    shareText: "AI 说我是游戏氪金战神人格，钱包表示打不过。",
  },
  online_shopping: {
    title: "网购拆箱成瘾人格",
    emoji: "BX",
    description: "你买的不是东西，是快递到站那一秒的 dopamine。",
    strengths: ["审美雷达灵敏", "很会发现新东西"],
    weaknesses: ["购物车会偷偷长出第二层"],
    behaviorFocus: "网购和冲动下单",
    roast: "你的快递不是包裹，是余额写给你的分手信。",
    benchmarkCategory: "online_shopping",
    benchmarkText: "你的网购支出接近学生购物偏高观察线。",
    riskText: "继续高频下单，月底预算可能会被快递柜提前签收。",
    challengeTitle: "购物车冷冻挑战",
    challengeTag: "#先放24小时再买",
    challengeDescription: "给每个想买的东西一个冷静期。",
    shareText: "AI 说我是网购拆箱成瘾人格，快递柜比我还懂我。",
  },
  transport: {
    title: "出门即打车人格",
    emoji: "TX",
    description: "你的出行哲学：能不走就不走，能直达就直达。",
    strengths: ["效率优先", "很懂省时间"],
    weaknesses: ["每次小车费加起来很有存在感"],
    behaviorFocus: "交通和即时出行",
    roast: "你不是懒，你是在用余额给双腿放年假。",
    benchmarkCategory: "transport",
    benchmarkText: "你的交通支出接近学生出行消费偏高区间。",
    riskText: "如果短途也频繁打车，交通预算会悄悄变成大头。",
    challengeTitle: "短途步行挑战",
    challengeTag: "#这单我自己走",
    challengeDescription: "把一笔短途打车换成走路或公交。",
    shareText: "AI 说我是出门即打车人格，路线规划第一名。",
  },
  social_meals: {
    title: "社交燃烧人格",
    emoji: "SC",
    description: "饭局不是饭局，是你的人际电量充电站。",
    strengths: ["社交能量足", "很会维护关系"],
    weaknesses: ["聚餐和活动会把预算点燃"],
    behaviorFocus: "聚餐和社交活动",
    roast: "你的钱包不是在消费，是在替你维持朋友圈热度。",
    benchmarkCategory: "social_meals",
    benchmarkText: "你的社交餐饮支出接近学生社交消费偏高区间。",
    riskText: "如果每场局都参加，预算会比你先社恐。",
    challengeTitle: "精选饭局挑战",
    challengeTag: "#少一场无效局",
    challengeDescription: "把一场可去可不去的局留给余额喘口气。",
    shareText: "AI 说我是社交燃烧人格，人还没累钱包先累了。",
  },
  study_supplies: {
    title: "卷王燃烧人格",
    emoji: "GR",
    description: "你不是在买学习用品，你是在给自律续燃料。",
    strengths: ["目标感强", "愿意投资成长"],
    weaknesses: ["效率工具容易买成仪式感"],
    behaviorFocus: "学习用品和效率投入",
    roast: "你的文具和课程都很努力，只有余额在默默掉线。",
    benchmarkCategory: "study_supplies",
    benchmarkText: "你的学习投入接近学生成长型消费偏高区间。",
    riskText: "继续囤效率工具，可能会先获得满级装备而不是满级效率。",
    challengeTitle: "先用完再买挑战",
    challengeTag: "#工具不是学习本身",
    challengeDescription: "先用完手头工具，再解锁下一件装备。",
    shareText: "AI 说我是卷王燃烧人格，自律和余额一起燃。",
  },
  campus_cafeteria: {
    title: "生存模式人格",
    emoji: "SV",
    description: "你的消费策略朴素直接：先活着，再讲别的。",
    strengths: ["预算意识在线", "基础开销稳定"],
    weaknesses: ["快乐预算容易被压到角落"],
    behaviorFocus: "校园餐和基础生活开销",
    roast: "你的消费像极简模式，余额没爆炸，但快乐也在省电。",
    benchmarkCategory: "campus_cafeteria",
    benchmarkText: "你的基础餐饮支出接近学生日常刚需区间。",
    riskText: "如果所有预算都压在刚需上，生活体验可能会过度省电。",
    challengeTitle: "小快乐预算挑战",
    challengeTag: "#给生活加一点糖",
    challengeDescription: "留一小笔不愧疚的快乐预算。",
    shareText: "AI 说我是生存模式人格，主打一个稳住别浪。",
  },
  subscriptions: {
    title: "焦虑奋斗人格",
    emoji: "AN",
    description: "会员、工具、课程都像你给未来买的保险。",
    strengths: ["上进心强", "愿意为长期目标投入"],
    weaknesses: ["订阅和工具会悄悄自动扣款"],
    behaviorFocus: "订阅和成长型消费",
    roast: "你的自动续费比闹钟还准，梦想还没开始，账单先自律了。",
    benchmarkCategory: "subscriptions",
    benchmarkText: "你的订阅支出接近学生工具型消费偏高区间。",
    riskText: "如果不清理低频订阅，固定支出会像后台程序一样常驻。",
    challengeTitle: "订阅体检挑战",
    challengeTag: "#砍掉一个闲置会员",
    challengeDescription: "清理一个最近没用过的订阅。",
    shareText: "AI 说我是焦虑奋斗人格，未来感很强，自动扣款也很强。",
  },
  other: {
    title: "生存模式人格",
    emoji: "SV",
    description: "你的消费记录暂时很分散，但整体偏向保守生存流。",
    strengths: ["不容易被单一类别绑架", "弹性空间还在"],
    weaknesses: ["杂项消费容易缺少感知"],
    behaviorFocus: "杂项和基础开销",
    roast: "你的账单像抽象派，看不出重点，但余额知道每一笔都是真的。",
    benchmarkCategory: "other",
    benchmarkText: "你的杂项支出暂时适合按估算型基准观察。",
    riskText: "如果杂项继续增加，预算会变得越来越难解释。",
    challengeTitle: "杂项命名挑战",
    challengeTag: "#给每笔钱一个名字",
    challengeDescription: "把一笔杂项改成更明确的类别。",
    shareText: "AI 说我是生存模式人格，账单很朴素但不无聊。",
  },
  fake_refined: {
    title: "假精致人格",
    emoji: "FJ",
    description: "你把生活质感安排得很满，余额负责在旁边沉默。",
    strengths: ["审美在线", "生活仪式感强"],
    weaknesses: ["精致组合拳容易叠出预算压力"],
    behaviorFocus: "网购、社交和订阅组合消费",
    roast: "你不是乱花钱，你是在给朋友圈、购物车和会员中心同时交保护费。",
    benchmarkCategory: "online_shopping",
    benchmarkText: "你的精致型组合支出接近学生生活方式消费偏高区间。",
    riskText: "网购、社交和订阅一起叠加时，预算会被温柔地掏空。",
    challengeTitle: "精致降噪挑战",
    challengeTag: "#少买一个氛围感",
    challengeDescription: "砍掉一个只为了氛围感的消费。",
    shareText: "AI 说我是假精致人格，精致是真的，余额紧张也是真的。",
  },
  anxious_hustler: {
    title: "焦虑奋斗人格",
    emoji: "AN",
    description: "你在用消费给未来加 buff，也给焦虑找出口。",
    strengths: ["行动力强", "愿意为成长投入"],
    weaknesses: ["工具、通勤和订阅容易叠成压力"],
    behaviorFocus: "学习、订阅和通勤组合消费",
    roast: "你的未来规划很满，余额像被拉进了一个没有尽头的待办清单。",
    benchmarkCategory: "study_supplies",
    benchmarkText: "你的奋斗型组合支出接近学生成长消费偏高区间。",
    riskText: "如果成长型消费缺少复盘，容易买到安心感而不是结果。",
    challengeTitle: "成长复盘挑战",
    challengeTag: "#先复盘再续费",
    challengeDescription: "续费或购买前，先写下它到底帮你完成了什么。",
    shareText: "AI 说我是焦虑奋斗人格，很努力，也很会给未来付定金。",
  },
  survival_mode: {
    title: "生存模式人格",
    emoji: "SV",
    description: "你的钱主要花在维持日常运转，快乐开销很克制。",
    strengths: ["抗风险意识强", "基础生活稳定"],
    weaknesses: ["长期太紧容易失去参与感"],
    behaviorFocus: "基础生活和必要支出",
    roast: "你的预算像省电模式，能跑很久，但屏幕亮度确实有点低。",
    benchmarkCategory: "campus_cafeteria",
    benchmarkText: "你的基础生活支出接近学生刚需消费观察线。",
    riskText: "如果长期只保留刚需，体验预算会越来越难被看见。",
    challengeTitle: "低成本快乐挑战",
    challengeTag: "#花小钱回血",
    challengeDescription: "安排一个低成本但真实开心的小活动。",
    shareText: "AI 说我是生存模式人格，稳是稳，快乐也要补一点。",
  },
};
